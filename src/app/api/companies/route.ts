// Companies API route - for company management
// Part of the SaaSGrid improvement plan implementation

import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch companies for the user
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
    
    return Response.json({ companies: companies || [] });
    
  } catch (error) {
    console.error('Companies GET API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return Response.json({ error: 'Company name is required' }, { status: 400 });
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
    
    // Create new company
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        description: description || null,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to create company' }, { status: 500 });
    }
    
    return Response.json({ company });
    
  } catch (error) {
    console.error('Companies POST API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
