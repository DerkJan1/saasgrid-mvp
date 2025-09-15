import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { CustomerMonth } from '@/types'

export async function parseSpreadsheet(file: File): Promise<CustomerMonth[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (extension === 'csv') {
    return parseCSV(file)
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file)
  } else {
    throw new Error('Unsupported file format')
  }
}

async function parseCSV(file: File): Promise<CustomerMonth[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors[0].message}`))
        } else {
          try {
            const transformed = transformData(results.data as Record<string, unknown>[])
            resolve(transformed)
          } catch (error) {
            reject(error)
          }
        }
      },
      error: (error) => reject(error)
    })
  })
}

async function parseExcel(file: File): Promise<CustomerMonth[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Transform to expected format
        const transformed = transformExcelData(jsonData as unknown[][])
        resolve(transformed)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

function transformData(data: Record<string, unknown>[]): CustomerMonth[] {
  // Expected CSV format: customerId, customerName, month, mrr
  // Or: Customer ID, Customer Name, Month, MRR
  const result: CustomerMonth[] = []
  
  for (const row of data) {
    if (!row || typeof row !== 'object') continue
    
    // Try different possible column names
    const customerId = row['customerId'] || row['Customer ID'] || row['customer_id'] || row['id']
    const customerName = row['customerName'] || row['Customer Name'] || row['customer_name'] || row['name']
    const month = row['month'] || row['Month'] || row['date'] || row['Date']
    const mrrValue = row['mrr'] || row['MRR'] || row['revenue'] || row['Revenue'] || '0'
    const mrr = parseFloat(String(mrrValue))
    
    if (customerId && customerName && month && !isNaN(mrr)) {
      result.push({
        customerId: String(customerId),
        customerName: String(customerName),
        month: formatMonth(month),
        mrr: mrr
      })
    }
  }
  
  if (result.length === 0) {
    throw new Error('No valid data found. Please ensure your file has columns: customerId, customerName, month, mrr')
  }
  
  return result
}

function transformExcelData(data: unknown[][]): CustomerMonth[] {
  if (data.length < 2) {
    throw new Error('Excel file must have at least a header row and one data row')
  }
  
  // First row is headers
  const headers = data[0].map(h => String(h).toLowerCase().trim())
  const result: CustomerMonth[] = []
  
  // Find column indices
  const customerIdIndex = findColumnIndex(headers, ['customerid', 'customer id', 'customer_id', 'id'])
  const customerNameIndex = findColumnIndex(headers, ['customername', 'customer name', 'customer_name', 'name'])
  const monthIndex = findColumnIndex(headers, ['month', 'date'])
  const mrrIndex = findColumnIndex(headers, ['mrr', 'revenue'])
  
  if (customerIdIndex === -1 || customerNameIndex === -1 || monthIndex === -1 || mrrIndex === -1) {
    throw new Error('Required columns not found. Please ensure your file has: customerId, customerName, month, mrr')
  }
  
  // Process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length === 0) continue
    
    const customerId = row[customerIdIndex]
    const customerName = row[customerNameIndex]
    const month = row[monthIndex]
    const mrr = parseFloat(String(row[mrrIndex] || '0'))
    
    if (customerId && customerName && month && !isNaN(mrr)) {
      result.push({
        customerId: String(customerId),
        customerName: String(customerName),
        month: formatMonth(month),
        mrr: mrr
      })
    }
  }
  
  if (result.length === 0) {
    throw new Error('No valid data found in Excel file')
  }
  
  return result
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.indexOf(name)
    if (index !== -1) return index
  }
  return -1
}

function formatMonth(month: unknown): string {
  // Handle different month formats
  if (!month) throw new Error('Invalid month value')
  
  const monthStr = String(month).trim()
  
  // If it's already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(monthStr)) {
    return monthStr
  }
  
  // If it's in MM/YYYY or MM-YYYY format
  if (/^\d{1,2}[\/\-]\d{4}$/.test(monthStr)) {
    const [m, y] = monthStr.split(/[\/\-]/)
    return `${y}-${m.padStart(2, '0')}`
  }
  
  // If it's in YYYY/MM or YYYY-MM format
  if (/^\d{4}[\/\-]\d{1,2}$/.test(monthStr)) {
    const [y, m] = monthStr.split(/[\/\-]/)
    return `${y}-${m.padStart(2, '0')}`
  }
  
  // Try to parse as date
  try {
    const date = new Date(monthStr)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      return `${year}-${month}`
    }
  } catch {
    // Fall through to error
  }
  
  throw new Error(`Invalid month format: ${monthStr}. Expected formats: YYYY-MM, MM/YYYY, or valid date`)
}
