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

export class SaaSMetricsCalculator {
  /**
   * Calculate all metrics for a given dataset
   */
  static calculateMetrics(data: CustomerMonth[]): MonthlyMetrics[] {
    // Group data by month
    const monthlyData = this.groupByMonth(data)
    const months = Array.from(monthlyData.keys()).sort()
    const results: MonthlyMetrics[] = []
    
    for (let i = 0; i < months.length; i++) {
      const currentMonth = months[i]
      const previousMonth = i > 0 ? months[i - 1] : null
      
      const currentCustomers = monthlyData.get(currentMonth) || []
      const previousCustomers = previousMonth ? monthlyData.get(previousMonth) || [] : []
      
      const metrics = this.calculateMonthMetrics(
        currentMonth,
        currentCustomers,
        previousCustomers
      )
      
      results.push(metrics)
    }
    
    return results
  }

  private static groupByMonth(data: CustomerMonth[]): Map<string, CustomerMonth[]> {
    const grouped = new Map<string, CustomerMonth[]>()
    
    for (const item of data) {
      if (!grouped.has(item.month)) {
        grouped.set(item.month, [])
      }
      grouped.get(item.month)!.push(item)
    }
    
    return grouped
  }

  private static calculateMonthMetrics(
    month: string,
    current: CustomerMonth[],
    previous: CustomerMonth[]
  ): MonthlyMetrics {
    // Create maps for easy lookup
    const currentMap = new Map(current.map(c => [c.customerId, c.mrr]))
    const previousMap = new Map(previous.map(c => [c.customerId, c.mrr]))
    
    let newMRR = 0
    let expansionMRR = 0
    let contractionMRR = 0
    let churnedMRR = 0
    // let retainedMRR = 0 // Commented out as it's calculated but not used in final metrics
    
    // Calculate new and expansion/contraction
    for (const [customerId, currentMrr] of currentMap) {
      const previousMrr = previousMap.get(customerId) || 0
      
      if (previousMrr === 0) {
        // New customer
        newMRR += currentMrr
      } else {
        // Existing customer
        // retainedMRR += Math.min(currentMrr, previousMrr) // Commented out as not used in final metrics
        if (currentMrr > previousMrr) {
          expansionMRR += currentMrr - previousMrr
        } else if (currentMrr < previousMrr) {
          contractionMRR += previousMrr - currentMrr
        }
      }
    }
    
    // Calculate churned
    for (const [customerId, previousMrr] of previousMap) {
      if (!currentMap.has(customerId)) {
        churnedMRR += previousMrr
      }
    }
    
    // Calculate totals
    const totalMRR = Array.from(currentMap.values()).reduce((sum, mrr) => sum + mrr, 0)
    const previousTotalMRR = Array.from(previousMap.values()).reduce((sum, mrr) => sum + mrr, 0)
    
    // Calculate retention rates
    const grossRevenueRetention = previousTotalMRR > 0
      ? (previousTotalMRR - churnedMRR - contractionMRR) / previousTotalMRR
      : 0
    
    const netRevenueRetention = previousTotalMRR > 0
      ? (previousTotalMRR - churnedMRR - contractionMRR + expansionMRR) / previousTotalMRR
      : 0
    
    // Calculate logo churn
    const previousCustomerCount = previousMap.size
    const churnedCustomers = Array.from(previousMap.keys())
      .filter(id => !currentMap.has(id)).length
    
    const logoChurnRate = previousCustomerCount > 0
      ? churnedCustomers / previousCustomerCount
      : 0
    
    return {
      month,
      totalMRR: Math.round(totalMRR * 100) / 100,
      arr: Math.round(totalMRR * 12 * 100) / 100,
      customerCount: currentMap.size,
      newMRR: Math.round(newMRR * 100) / 100,
      expansionMRR: Math.round(expansionMRR * 100) / 100,
      contractionMRR: Math.round(contractionMRR * 100) / 100,
      churnedMRR: Math.round(churnedMRR * 100) / 100,
      grossRevenueRetention: Math.round(grossRevenueRetention * 10000) / 10000,
      netRevenueRetention: Math.round(netRevenueRetention * 10000) / 10000,
      logoChurnRate: Math.round(logoChurnRate * 10000) / 10000
    }
  }
}
