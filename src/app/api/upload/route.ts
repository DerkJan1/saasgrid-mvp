// Upload API route with validation and snapshot capabilities
// Implements Step 4 from the SaaSGrid improvement plan

import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { validateCsv, formatValidationErrors } from '@/lib/csv-validate';
import { parseSpreadsheet } from '@/lib/file-parser';
import { type MonthlyMetric } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!companyId) {
      return Response.json({ error: 'Company ID is required' }, { status: 400 });
    }
    
    // Validate file type and size
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return Response.json({ 
        error: 'Invalid file type. Only CSV, XLS, and XLSX files are supported.' 
      }, { status: 400 });
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return Response.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    );
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify company ownership
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();
    
    if (companyError || !company) {
      return Response.json({ error: 'Invalid company or access denied' }, { status: 403 });
    }
    
    let parsedData: any[];
    let validationResult: any;
    
    try {
      // Parse file based on type
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        validationResult = validateCsv(text);
        
        if (!validationResult.isValid) {
          return Response.json({
            error: 'Validation failed',
            validationErrors: formatValidationErrors(validationResult),
            summary: validationResult.summary
          }, { status: 422 });
        }
        
        parsedData = validationResult.rows;
      } else {
        // Use existing Excel parser for .xlsx/.xls files
        const customerMonthData = await parseSpreadsheet(file);
        
        // Transform CustomerMonth data to MonthlyMetric format
        const monthlyMetrics = new Map<string, MonthlyMetric>();
        
        customerMonthData.forEach(item => {
          const month = item.month;
          if (!monthlyMetrics.has(month)) {
            monthlyMetrics.set(month, {
              month,
              mrr: 0,
              customers: 0,
              new_mrr: 0,
              expansion_mrr: 0,
              contraction_mrr: 0,
              churned_mrr: 0,
            });
          }
          
          const metric = monthlyMetrics.get(month)!;
          metric.mrr += item.mrr;
          metric.customers += 1;
        });
        
        parsedData = Array.from(monthlyMetrics.values());
      }
      
      if (parsedData.length === 0) {
        return Response.json({ 
          error: 'No valid data found in file' 
        }, { status: 422 });
      }
      
      // Create snapshot for rollback capability
      const snapshot = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        userId: user.id,
        companyId,
        dataPreview: parsedData.slice(0, 5), // Store first 5 rows for preview
        totalRows: parsedData.length,
        validationSummary: validationResult?.summary || null
      };
      
      // Start transaction: create upload job first
      const { data: uploadJob, error: jobError } = await supabase
        .from('upload_jobs')
        .insert({
          company_id: companyId,
          file_name: file.name,
          file_size: file.size,
          status: 'processing',
          snapshot: snapshot,
          user_id: user.id
        })
        .select()
        .single();
      
      if (jobError) {
        console.error('Failed to create upload job:', jobError);
        return Response.json({ error: 'Failed to create upload job' }, { status: 500 });
      }
      
      // Upsert metrics data
      const metricsToInsert = parsedData.map(metric => ({
        company_id: companyId,
        month: metric.month,
        mrr: metric.mrr || 0,
        new_mrr: metric.new_mrr || 0,
        expansion_mrr: metric.expansion_mrr || 0,
        contraction_mrr: metric.contraction_mrr || 0,
        churned_mrr: metric.churned_mrr || 0,
        customers: metric.customers || 0,
      }));
      
      const { error: metricsError } = await supabase
        .from('monthly_metrics')
        .upsert(metricsToInsert, { 
          onConflict: 'company_id,month',
          ignoreDuplicates: false 
        });
      
      if (metricsError) {
        // Update job status to failed
        await supabase
          .from('upload_jobs')
          .update({ status: 'failed', error_message: metricsError.message })
          .eq('id', uploadJob.id);
        
        console.error('Failed to insert metrics:', metricsError);
        return Response.json({ error: 'Failed to save metrics data' }, { status: 500 });
      }
      
      // Update job status to completed
      await supabase
        .from('upload_jobs')
        .update({ 
          status: 'completed',
          rows_processed: parsedData.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', uploadJob.id);
      
      return Response.json({
        success: true,
        uploadJobId: uploadJob.id,
        rowsProcessed: parsedData.length,
        summary: {
          totalRows: parsedData.length,
          dateRange: {
            start: Math.min(...parsedData.map(d => d.month)),
            end: Math.max(...parsedData.map(d => d.month))
          }
        },
        validationSummary: validationResult?.summary || null
      });
      
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return Response.json({
        error: 'Failed to parse file',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      }, { status: 422 });
    }
    
  } catch (error) {
    console.error('Upload API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to fetch upload history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return Response.json({ error: 'Company ID is required' }, { status: 400 });
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    );
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch upload history
    const { data: uploads, error } = await supabase
      .from('upload_jobs')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch upload history' }, { status: 500 });
    }
    
    return Response.json({ uploads: uploads || [] });
    
  } catch (error) {
    console.error('Upload history API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
