import { CustomerMonth } from '@/types'

export class DebugHelper {
  static logExcelStructure(data: unknown[][], label: string) {
    console.group(`🔍 ${label}`)
    console.log(`Total rows: ${data.length}`)
    
    if (data.length > 0) {
      console.log(`Headers (Row 0):`, data[0])
      console.log(`Row 1:`, data[1])
      console.log(`Row 2:`, data[2])
      console.log(`Last row:`, data[data.length - 1])
    }
    
    console.groupEnd()
  }

  static logObjectData(data: Record<string, unknown>[], label: string) {
    console.group(`🔍 ${label}`)
    console.log(`Total objects: ${data.length}`)
    
    if (data.length > 0) {
      console.log(`First object keys:`, Object.keys(data[0]))
      console.log(`First object:`, data[0])
      console.log(`Second object:`, data[1])
      console.log(`Last object:`, data[data.length - 1])
    }
    
    console.groupEnd()
  }

  static logCustomerMonthData(data: CustomerMonth[], label: string) {
    console.group(`🔍 ${label}`)
    console.log(`Total records: ${data.length}`)
    
    if (data.length > 0) {
      const uniqueCustomers = new Set(data.map(d => d.customerId))
      const months = [...new Set(data.map(d => d.month))].sort()
      const totalMRR = data.reduce((sum, d) => sum + d.mrr, 0)
      
      console.log(`Unique customers: ${uniqueCustomers.size}`)
      console.log(`Customer IDs:`, Array.from(uniqueCustomers))
      console.log(`Date range: ${months[0]} to ${months[months.length - 1]}`)
      console.log(`Total MRR: $${totalMRR.toLocaleString()}`)
      console.log(`Sample records:`, data.slice(0, 5))
      
      // Group by customer to see distribution
      const byCustomer = new Map<string, CustomerMonth[]>()
      data.forEach(record => {
        if (!byCustomer.has(record.customerId)) {
          byCustomer.set(record.customerId, [])
        }
        byCustomer.get(record.customerId)!.push(record)
      })
      
      console.log(`Records per customer:`)
      Array.from(byCustomer.entries()).forEach(([customerId, records]) => {
        console.log(`  ${customerId}: ${records.length} records`)
      })
    }
    
    console.groupEnd()
  }

  static validateSaaSData(data: CustomerMonth[]): { 
    isValid: boolean
    issues: string[]
    recommendations: string[]
    stats: {
      customers: number
      records: number
      dateRange: string
      avgRecordsPerCustomer: number
      dataSpan: number
    }
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    if (data.length === 0) {
      issues.push('No data found')
      return { 
        isValid: false, 
        issues, 
        recommendations,
        stats: { customers: 0, records: 0, dateRange: '', avgRecordsPerCustomer: 0, dataSpan: 0 }
      }
    }

    // Enterprise-scale analysis
    const uniqueCustomers = new Set(data.map(d => d.customerId))
    const months = [...new Set(data.map(d => d.month))].sort()
    const avgRecordsPerCustomer = data.length / uniqueCustomers.size
    
    // Calculate data span in months
    const startDate = new Date(months[0] + '-01')
    const endDate = new Date(months[months.length - 1] + '-01')
    const dataSpan = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

    // Validation for enterprise datasets
    if (uniqueCustomers.size === 1 && data.length < 50) {
      issues.push('Only 1 unique customer found - likely parsing error')
      recommendations.push('Check Excel row processing loop')
    }

    // Dynamic date range validation
    if (months.length < 3) {
      issues.push(`Only ${months.length} months found - insufficient data for SaaS metrics`)
      recommendations.push('Ensure data spans at least 3 months')
    }

    // Enterprise data quality checks
    const zeroMRR = data.filter(d => d.mrr === 0).length
    const negativeMRR = data.filter(d => d.mrr < 0).length
    const highMRR = data.filter(d => d.mrr > 1000000).length // >$1M MRR
    
    if (negativeMRR > 0) {
      issues.push(`${negativeMRR} records have negative MRR`)
      recommendations.push('Review negative MRR values - may indicate data errors')
    }

    if (highMRR > 0) {
      console.warn(`📊 ${highMRR} records with MRR >$1M detected - enterprise customers`)
    }

    // Variable completeness calculation (handles different customer lifespans)
    const customerSpans = new Map<string, number>()
    uniqueCustomers.forEach(customerId => {
      const customerRecords = data.filter(d => d.customerId === customerId)
      customerSpans.set(customerId, customerRecords.length)
    })

    const avgCustomerSpan = Array.from(customerSpans.values()).reduce((a, b) => a + b, 0) / customerSpans.size
    const expectedCompleteness = avgCustomerSpan / dataSpan
    
    if (expectedCompleteness < 0.3) {
      issues.push(`Low data density: avg ${avgCustomerSpan.toFixed(1)} records per customer over ${dataSpan} month span`)
      recommendations.push('This is normal for datasets with customer churn/acquisition over time')
    }

    // Performance warnings for large datasets
    if (data.length > 100000) {
      console.log(`📊 Large dataset: ${data.length} records processed successfully`)
    }

    const stats = {
      customers: uniqueCustomers.size,
      records: data.length,
      dateRange: `${months[0]} to ${months[months.length - 1]}`,
      avgRecordsPerCustomer: Math.round(avgRecordsPerCustomer * 10) / 10,
      dataSpan
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
      stats
    }
  }
}
