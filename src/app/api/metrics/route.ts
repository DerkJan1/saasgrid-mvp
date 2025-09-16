// Working metrics API route - implements Step 4 from improvement plan
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateMetrics, calculateMetricsSeries, type MonthlyMetric } from '@/lib/metrics';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return Response.json({ error: 'Missing companyId parameter' }, { status: 400 });
    }
    
    // Create Supabase client with service role for server-side access
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
    
    // Query monthly metrics data
    const { data: monthlyData, error } = await supabase
      .from('monthly_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('month', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch metrics data' }, { status: 500 });
    }
    
    // If no data found, return empty metrics
    if (!monthlyData || monthlyData.length === 0) {
      return Response.json({
        latest: calculateMetrics([]),
        series: [],
        hasData: false
      });
    }
    
    // Transform database data to MonthlyMetric format
    const metricsData: MonthlyMetric[] = monthlyData.map(row => ({
      month: row.month,
      mrr: row.mrr || 0,
      new_mrr: row.new_mrr || 0,
      expansion_mrr: row.expansion_mrr || 0,
      contraction_mrr: row.contraction_mrr || 0,
      churned_mrr: row.churned_mrr || 0,
      customers: row.customers || 0,
      company_id: row.company_id
    }));
    
    // Calculate latest metrics and time series
    const latest = calculateMetrics(metricsData);
    const series = calculateMetricsSeries(metricsData);
    
    return Response.json({
      latest,
      series,
      hasData: true,
      dataRange: {
        start: metricsData[0]?.month,
        end: metricsData[metricsData.length - 1]?.month,
        months: metricsData.length
      }
    });
    
  } catch (error) {
    console.error('Metrics API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for updating metrics (for future use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, metrics } = body;
    
    if (!companyId || !metrics) {
      return Response.json({ error: 'Missing companyId or metrics data' }, { status: 400 });
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
    
    // Upsert metrics data
    const { error } = await supabase
      .from('monthly_metrics')
      .upsert(
        metrics.map((metric: MonthlyMetric) => ({
          company_id: companyId,
          month: metric.month,
          mrr: metric.mrr,
          new_mrr: metric.new_mrr || 0,
          expansion_mrr: metric.expansion_mrr || 0,
          contraction_mrr: metric.contraction_mrr || 0,
          churned_mrr: metric.churned_mrr || 0,
          customers: metric.customers || 0,
        })),
        { 
          onConflict: 'company_id,month',
          ignoreDuplicates: false 
        }
      );
    
    if (error) {
      console.error('Database upsert error:', error);
      return Response.json({ error: 'Failed to update metrics' }, { status: 500 });
    }
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Metrics POST API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
