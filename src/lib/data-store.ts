import { CustomerMonth, MonthlyMetrics } from '@/types'
import { SaaSMetricsCalculator } from '@/lib/calculations/metrics'

const DATA_KEY = 'saasgrid_customer_data'
const METRICS_KEY = 'saasgrid_metrics_data'

export class DataStore {
  // Save customer data to localStorage
  static saveCustomerData(data: CustomerMonth[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
      
      // Calculate and save metrics
      const metrics = SaaSMetricsCalculator.calculateMetrics(data)
      localStorage.setItem(METRICS_KEY, JSON.stringify(metrics))
      
      console.log('📊 Data saved:', { customers: data.length, metrics: metrics.length })
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }

  // Load customer data from localStorage
  static getCustomerData(): CustomerMonth[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(DATA_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load customer data:', error)
      return []
    }
  }

  // Load calculated metrics from localStorage
  static getMetrics(): MonthlyMetrics[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(METRICS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load metrics:', error)
      return []
    }
  }

  // Check if we have any data
  static hasData(): boolean {
    if (typeof window === 'undefined') return false
    
    const customerData = this.getCustomerData()
    return customerData.length > 0
  }

  // Clear all data
  static clearData(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(DATA_KEY)
      localStorage.removeItem(METRICS_KEY)
      console.log('📊 Data cleared')
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }

  // Get summary stats for display
  static getDataSummary(): {
    totalRecords: number
    uniqueCustomers: number
    dateRange: string
    totalMRR: number
  } | null {
    const data = this.getCustomerData()
    if (data.length === 0) return null

    const uniqueCustomers = new Set(data.map(d => d.customerId)).size
    const months = data.map(d => d.month).sort()
    const dateRange = `${months[0]} - ${months[months.length - 1]}`
    const totalMRR = data.reduce((sum, d) => sum + d.mrr, 0)

    return {
      totalRecords: data.length,
      uniqueCustomers,
      dateRange,
      totalMRR
    }
  }
}
