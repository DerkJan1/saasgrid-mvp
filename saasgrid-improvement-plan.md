# SaaSGrid MVP Improvement Plan - From Current State to V3

## MODE: PLAN
**You are operating on branch v3/hybrid-saasboard-ui**

## Executive Summary - Your Current State vs. Target

### ✅ What You Already Have (Keep & Refine)
- **Next.js 14 App Router** with TypeScript - solid foundation
- **Supabase Auth** with magic links - working, just needs protection on routes
- **Database tables** exist but need simplification (5 tables → 3 tables)
- **CSV/XLSX upload** foundation with xlsx/papaparse - needs validation layer
- **Tailwind + shadcn/ui** - keep this, add patterns from saasboard
- **Recharts** installed - needs actual chart implementations

### 🔧 What Needs Fixing (Priority 1)
1. **Implement missing metrics calculations** (MRR, ARR, MoM%, NRR%)
2. **Add CSV validation** with row-level error reporting
3. **Build actual API routes** that work (/api/upload, /api/metrics, /api/companies)
4. **Polish UI** using saasboard patterns (sidebar, KPI cards, professional charts)

### 🎯 What to Add (Priority 2)
- Upload history with rollback capability
- Company selector and date filters
- "Last updated" badge
- Empty states and loading skeletons
- Growth accounting stacked bar chart

## Step-by-Step Improvement Plan

### Step 1: UI Shell Upgrade (Borrow from saasboard)
**Current:** Basic pages without consistent layout
**Target:** Professional dashboard shell

```typescript
// Files to modify/create:
/src/app/(dashboard)/layout.tsx         # Add sidebar + header
/src/components/layout/Sidebar.tsx      # Adapt from saasboard (MIT)
/src/components/layout/Topbar.tsx       # Company selector, user menu
```

**Actions:**
1. Copy saasboard's sidebar pattern, convert from Vite/React to Next.js
2. Add navigation items: Overview, Upload History, Settings
3. Add MIT attribution: `// Adapted from MekuHQ/saasboard (MIT)`
4. Keep your color scheme: #04F781, #00796B, #F5F5DC

### Step 2: Simplify Database Schema
**Current:** 5 tables (organizations, uploads, customers, mrr_snapshots, metrics_summary)
**Target:** 3 tables for simpler MVP

```sql
-- Migration: Consolidate to 3 tables
-- 1. Keep 'companies' (rename from organizations)
ALTER TABLE organizations RENAME TO companies;

-- 2. Create unified 'monthly_metrics' (merge mrr_snapshots + metrics_summary)
CREATE TABLE monthly_metrics (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  mrr NUMERIC NOT NULL,
  new_mrr NUMERIC DEFAULT 0,
  expansion_mrr NUMERIC DEFAULT 0,
  contraction_mrr NUMERIC DEFAULT 0,
  churned_mrr NUMERIC DEFAULT 0,
  customers INTEGER,
  PRIMARY KEY (company_id, month)
);

-- 3. Keep 'upload_jobs' but add snapshot field
ALTER TABLE uploads RENAME TO upload_jobs;
ALTER TABLE upload_jobs ADD COLUMN snapshot JSONB;
```

### Step 3: Fix Metrics Calculation (Currently Missing!)
**Current:** No calculation logic implemented
**Target:** Server-side calculations in API routes

```typescript
// Create: /src/lib/metrics.ts
export function calculateMetrics(data: MonthlyMetric[]) {
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  return {
    mrr: latest.mrr,
    arr: latest.mrr * 12,
    mom: previous ? ((latest.mrr - previous.mrr) / previous.mrr) * 100 : 0,
    nrr: calculateNRR(latest, previous), // if optional fields exist
  };
}
```

### Step 4: Build Working API Routes
**Current:** API routes exist but don't perform validation or calculations
**Target:** Functional APIs with proper validation

```typescript
// Fix: /src/app/api/upload/route.ts
export async function POST(req: Request) {
  // 1. Parse file (you have xlsx/papaparse)
  // 2. ADD: Validate headers (month, mrr required)
  // 3. ADD: Check for negatives, coerce dates
  // 4. ADD: Build snapshot for rollback
  // 5. Upsert to monthly_metrics
  // 6. Return success or row-level errors
}

// Create: /src/app/api/metrics/route.ts
export async function GET(req: Request) {
  // 1. Query monthly_metrics for company
  // 2. Calculate KPIs server-side
  // 3. Return { latest: {...}, series: [...] }
}
```

### Step 5: Upgrade Dashboard Components
**Current:** Components exist but incomplete
**Target:** Professional KPI cards and charts

```typescript
// Upgrade: /src/components/dashboard/KpiCard.tsx
// - Add trend arrows (↑/↓)
// - Add percentage change
// - Use shadcn Card component
// - Match saasboard styling

// Implement: /src/components/charts/MrrLineChart.tsx
// - Use Recharts LineChart
// - Responsive container
// - Tooltips with formatted values
// - Month labels on x-axis
```

### Step 6: Add Missing Features
**Current:** No upload history, no filters, no rollback
**Target:** Complete upload workflow

```typescript
// Create: /src/components/upload/UploadHistoryList.tsx
// - Query upload_jobs table
// - Show date, rows, status
// - Rollback button per job

// Create: /src/components/CompanySelect.tsx
// - Dropdown using shadcn Select
// - Fetch from /api/companies

// Add to dashboard: Date range picker
```

## File-by-File Implementation Checklist

### 🔴 Must Fix/Create (Week 1)
- [ ] `/src/lib/csv-validate.ts` - Row-level validation
- [ ] `/src/lib/metrics.ts` - Calculation functions  
- [ ] `/src/app/api/upload/route.ts` - Add validation + snapshot
- [ ] `/src/app/api/metrics/route.ts` - Create from scratch
- [ ] `/src/app/api/companies/route.ts` - List/create companies
- [ ] `/src/app/(dashboard)/layout.tsx` - Add sidebar/header

### 🟡 Should Improve (Week 2)
- [ ] `/src/components/layout/Sidebar.tsx` - Adapt from saasboard
- [ ] `/src/components/dashboard/KpiCard.tsx` - Add trends
- [ ] `/src/components/charts/MrrLineChart.tsx` - Implement properly
- [ ] `/src/components/upload/UploadDialog.tsx` - Add validation UI
- [ ] Database migration to 3 tables

### 🟢 Nice to Have (Week 3)
- [ ] `/src/app/api/rollback/route.ts` - Restore snapshots
- [ ] `/src/components/upload/UploadHistoryList.tsx` - Full history
- [ ] `/src/components/charts/GrowthStackedBar.tsx` - If optional fields
- [ ] Empty states, loading skeletons
- [ ] DataHealth badge

## Quick-Win Code Snippets

### 1. CSV Validation (You're Missing This!)
```typescript
// /src/lib/csv-validate.ts
import { parse } from 'papaparse';

export interface RowError {
  row: number;
  message: string;
}

export function validateCsv(text: string): { errors: RowError[]; rows: any[] } {
  const result = parse(text, { header: true, skipEmptyLines: true });
  const errors: RowError[] = [];
  const rows: any[] = [];
  
  const required = ['month', 'mrr'];
  const headers = Object.keys(result.data[0] || {});
  
  // Check required headers
  for (const req of required) {
    if (!headers.includes(req)) {
      errors.push({ row: 0, message: `Missing required column: ${req}` });
    }
  }
  
  // Validate each row
  result.data.forEach((row: any, i: number) => {
    // Coerce month to YYYY-MM-01
    if (row.month && !/^\d{4}-\d{2}/.test(row.month)) {
      errors.push({ row: i + 2, message: 'Invalid month format' });
    }
    
    // Check for negative MRR
    if (Number(row.mrr) < 0) {
      errors.push({ row: i + 2, message: 'MRR cannot be negative' });
    }
    
    if (errors.length === 0) {
      rows.push({
        ...row,
        month: row.month.slice(0, 7) + '-01',
        mrr: Number(row.mrr) || 0
      });
    }
  });
  
  return { errors, rows };
}
```

### 2. Working Metrics API (Currently Missing!)
```typescript
// /src/app/api/metrics/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateMetrics } from '@/lib/metrics';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  
  if (!companyId) {
    return Response.json({ error: 'Missing companyId' }, { status: 400 });
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies }
  );
  
  const { data, error } = await supabase
    .from('monthly_metrics')
    .select('*')
    .eq('company_id', companyId)
    .order('month', { ascending: true });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  const latest = calculateMetrics(data || []);
  
  return Response.json({
    latest,
    series: data || []
  });
}
```

### 3. Professional KPI Card (Upgrade Yours)
```typescript
// /src/components/dashboard/KpiCard.tsx
// Portions adapted from MekuHQ/saasboard (MIT)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'percentage' | 'number';
}

export function KpiCard({ title, value, previousValue, format = 'number' }: KpiCardProps) {
  const change = previousValue 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;
    
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency': return `$${val.toLocaleString()}`;
      case 'percentage': return `${val.toFixed(1)}%`;
      default: return val.toLocaleString();
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change && (
          <div className="flex items-center pt-1">
            {Number(change) > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs text-muted-foreground ml-1">
              {Math.abs(Number(change))}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Environment Variables to Add

```env
# .env.local (already have some of these)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Server only!
```

## Definition of Done - Week 1 Checklist

- [ ] Dashboard shows real calculated metrics (not hardcoded)
- [ ] CSV upload validates and shows row-level errors
- [ ] Sidebar navigation works (adapted from saasboard)
- [ ] KPI cards show trends and percentage changes
- [ ] MRR line chart displays actual data
- [ ] Database simplified to 3 tables
- [ ] All API routes return proper data
- [ ] Auth protects dashboard routes
- [ ] MIT attribution added where code adapted

## Stoplight Summary

### 🟢 Green (You're Good Here)
- Tech stack (Next.js 14, Supabase, Tailwind)
- Basic auth setup
- File parsing libraries

### 🟡 Yellow (Needs Work)
- Database schema (simplify from 5 to 3 tables)
- UI components (exist but need polish)
- Upload flow (works but no validation)

### 🔴 Red (Critical Gaps)
- **Metrics calculations NOT IMPLEMENTED**
- **API routes don't do their job**
- **No validation on CSV uploads**
- **No upload history or rollback**

## Next Command for Cursor

After creating branch and adding this doc, paste this to Cursor:

```
MODE: EXECUTE

Starting from our existing codebase, implement Step 1 (UI Shell) and Step 3 (Metrics Calculation):

1. Adapt the sidebar layout from MekuHQ/saasboard (MIT) to our Next.js structure
2. Create /src/lib/metrics.ts with calculateMetrics function
3. Implement /src/app/api/metrics/route.ts 
4. Update KpiCard component with trends
5. Add MIT attribution comments where we adapt code

Current files to modify:
- /src/app/(dashboard)/layout.tsx
- /src/components/dashboard/KpiCard.tsx

New files to create:
- /src/components/layout/Sidebar.tsx
- /src/lib/metrics.ts
- /src/app/api/metrics/route.ts

Keep all our existing Supabase setup and auth.
```