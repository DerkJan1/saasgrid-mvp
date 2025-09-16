// Core metrics calculation functions for SaaS analytics
// Based on the SaaSGrid improvement plan

export interface MonthlyMetric {
  month: string; // YYYY-MM format
  mrr: number;
  new_mrr?: number;
  expansion_mrr?: number;
  contraction_mrr?: number;
  churned_mrr?: number;
  customers?: number;
  company_id?: string;
}

export interface CalculatedMetrics {
  // Core metrics
  mrr: number;
  arr: number;
  customerCount: number;
  
  // Growth metrics
  mom: number; // Month-over-month growth %
  nrr: number; // Net Revenue Retention
  grr: number; // Gross Revenue Retention
  churnRate: number;
  
  // Additional metrics
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  
  // Magic Number
  magicNumber?: number;
}

/**
 * Calculate comprehensive SaaS metrics from monthly data
 * @param data Array of monthly metrics, should be sorted by month ascending
 * @returns Calculated metrics for the latest month
 */
export function calculateMetrics(data: MonthlyMetric[]): CalculatedMetrics {
  if (!data || data.length === 0) {
    return {
      mrr: 0,
      arr: 0,
      customerCount: 0,
      mom: 0,
      nrr: 1,
      grr: 1,
      churnRate: 0,
      newMrr: 0,
      expansionMrr: 0,
      contractionMrr: 0,
      churnedMrr: 0,
    };
  }

  // Sort data by month to ensure correct order
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  
  const latest = sortedData[sortedData.length - 1];
  const previous = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
  
  // Core metrics
  const mrr = latest.mrr || 0;
  const arr = mrr * 12;
  const customerCount = latest.customers || 0;
  
  // Month-over-month growth
  const mom = previous ? ((mrr - previous.mrr) / previous.mrr) * 100 : 0;
  
  // Revenue components (use provided values or calculate from MRR change)
  const newMrr = latest.new_mrr || 0;
  const expansionMrr = latest.expansion_mrr || 0;
  const contractionMrr = latest.contraction_mrr || 0;
  const churnedMrr = latest.churned_mrr || 0;
  
  // Calculate Net Revenue Retention (NRR)
  let nrr = 1; // Default 100%
  if (previous && previous.mrr > 0) {
    // NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR
    const retainedMrr = previous.mrr - churnedMrr + expansionMrr - contractionMrr;
    nrr = retainedMrr / previous.mrr;
  }
  
  // Calculate Gross Revenue Retention (GRR)
  let grr = 1; // Default 100%
  if (previous && previous.mrr > 0) {
    // GRR = (Starting MRR - Contraction - Churn) / Starting MRR
    const grossRetainedMrr = previous.mrr - contractionMrr - churnedMrr;
    grr = grossRetainedMrr / previous.mrr;
  }
  
  // Calculate Customer Churn Rate
  let churnRate = 0;
  if (previous && previous.customers && previous.customers > 0) {
    // Simple estimate: assume churned MRR represents churned customers
    // This is approximate - ideally we'd have actual customer churn data
    const averageMrrPerCustomer = previous.mrr / previous.customers;
    const estimatedChurnedCustomers = averageMrrPerCustomer > 0 ? churnedMrr / averageMrrPerCustomer : 0;
    churnRate = estimatedChurnedCustomers / previous.customers;
  }
  
  // Calculate Magic Number (if we have sufficient data)
  let magicNumber: number | undefined;
  if (sortedData.length >= 2 && previous) {
    // Magic Number = Net New MRR / Sales & Marketing Spend
    // For now, we'll use Net New MRR / Previous MRR as a growth efficiency metric
    const netNewMrr = newMrr + expansionMrr - contractionMrr - churnedMrr;
    if (previous.mrr > 0) {
      magicNumber = netNewMrr / previous.mrr;
    }
  }
  
  return {
    mrr,
    arr,
    customerCount,
    mom,
    nrr: Math.max(0, nrr), // Ensure non-negative
    grr: Math.max(0, grr), // Ensure non-negative
    churnRate: Math.max(0, Math.min(1, churnRate)), // Clamp between 0-100%
    newMrr,
    expansionMrr,
    contractionMrr,
    churnedMrr,
    magicNumber,
  };
}

/**
 * Calculate metrics for multiple months (for time series charts)
 * @param data Array of monthly metrics
 * @returns Array of calculated metrics for each month
 */
export function calculateMetricsSeries(data: MonthlyMetric[]): (CalculatedMetrics & { month: string })[] {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const results: (CalculatedMetrics & { month: string })[] = [];
  
  for (let i = 0; i < sortedData.length; i++) {
    const monthData = sortedData.slice(0, i + 1); // Include all data up to current month
    const metrics = calculateMetrics(monthData);
    results.push({
      ...metrics,
      month: sortedData[i].month,
    });
  }
  
  return results;
}

/**
 * Validate monthly metrics data
 * @param data Array of monthly metrics to validate
 * @returns Array of validation errors
 */
export function validateMetricsData(data: MonthlyMetric[]): string[] {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('No data provided');
    return errors;
  }
  
  data.forEach((metric, index) => {
    if (!metric.month) {
      errors.push(`Row ${index + 1}: Missing month`);
    } else if (!/^\d{4}-\d{2}/.test(metric.month)) {
      errors.push(`Row ${index + 1}: Invalid month format (expected YYYY-MM)`);
    }
    
    if (typeof metric.mrr !== 'number' || metric.mrr < 0) {
      errors.push(`Row ${index + 1}: Invalid MRR value`);
    }
    
    if (metric.customers !== undefined && (typeof metric.customers !== 'number' || metric.customers < 0)) {
      errors.push(`Row ${index + 1}: Invalid customer count`);
    }
  });
  
  return errors;
}

/**
 * Format currency values for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
