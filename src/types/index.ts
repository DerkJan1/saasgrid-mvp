export interface MRRData {
  month: string
  customerId: string
  customerName: string
  mrr: number
}

export interface ProcessedMetrics {
  month: string
  totalMRR: number
  arr: number
  customerCount: number
  newMRR: number
  expansionMRR: number
  contractionMRR: number
  churnedMRR: number
  grossRevenueRetention: number
  netRevenueRetention: number
  logoChurnRate: number
}

export interface UploadResult {
  success: boolean
  message: string
  data?: ProcessedMetrics[]
  error?: string
}

export interface CustomerMonth {
  customerId: string
  customerName: string
  month: string
  mrr: number
}

export interface MonthlyMetrics {
  month: string
  totalMRR: number
  arr: number
  customerCount: number
  newMRR: number
  expansionMRR: number
  contractionMRR: number
  churnedMRR: number
  grossRevenueRetention: number
  netRevenueRetention: number
  logoChurnRate: number
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Upload {
  id: string
  organization_id: string
  file_name: string
  file_size: number
  uploaded_by: string
  processed_at?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error_message?: string
  created_at: string
}

export interface Customer {
  id: string
  organization_id: string
  customer_name: string
  customer_id: string
  created_at: string
}

export interface MRRSnapshot {
  id: string
  organization_id: string
  customer_id: string
  month: string
  mrr: number
  created_at: string
}

export interface MetricsSummary {
  id: string
  organization_id: string
  month: string
  total_mrr: number
  arr: number
  customer_count: number
  new_mrr: number
  expansion_mrr: number
  contraction_mrr: number
  churned_mrr: number
  gross_revenue_retention: number
  net_revenue_retention: number
  logo_churn_rate: number
  created_at: string
}
