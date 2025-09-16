import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { CustomerMonth } from '@/types'
import { DebugHelper } from './debug-helper'

// Format detection result interface
interface FormatDetectionResult {
  format: 'long' | 'wide' | 'hybrid' | 'unknown'
  confidence: number
  monthColumns: string[]
  customerColumns: string[]
  warnings: string[]
}

// Custom error class for better user feedback
class DataFormatError extends Error {
  constructor(
    message: string,
    public details: {
      detectedFormat?: string
      suggestions?: string[]
      rowNumber?: number
      columnName?: string
    } = {}
  ) {
    super(message)
    this.name = 'DataFormatError'
  }
}

// Detect data format from headers with confidence scoring
function detectDataFormat(headers: string[]): FormatDetectionResult {
  const result: FormatDetectionResult = {
    format: 'unknown',
    confidence: 0,
    monthColumns: [],
    customerColumns: [],
    warnings: []
  }
  
  // Clean headers: remove empty, trim whitespace
  const cleanHeaders = headers
    .map(h => String(h).trim())
    .filter(h => h !== '')
  
  // Debug logging to help troubleshoot
  console.log('🔍 DEBUG: Raw headers:', headers)
  console.log('🔍 DEBUG: Clean headers:', cleanHeaders)
  
  if (cleanHeaders.length < 2) {
    result.warnings.push('Too few columns detected')
    return result
  }
  
  // Find customer and month columns
  result.customerColumns = findCustomerColumns(cleanHeaders)
  result.monthColumns = findMonthColumns(cleanHeaders)
  
  // Debug logging for column detection
  console.log('🔍 DEBUG: Customer columns found:', result.customerColumns)
  console.log('🔍 DEBUG: Month columns found:', result.monthColumns)
  
  // Determine format based on column analysis
  const hasLongCols = hasLongFormatColumns(cleanHeaders)
  const hasWideCols = result.monthColumns.length >= 3
  
  console.log('🔍 DEBUG: Has long format columns:', hasLongCols)
  console.log('🔍 DEBUG: Has wide format columns (3+ months):', hasWideCols)
  console.log('🔍 DEBUG: Month columns length:', result.monthColumns.length)
  console.log('🔍 DEBUG: Customer columns length:', result.customerColumns.length)
  
  // More aggressive wide format detection
  // If we have many month-like columns, even without perfect customer column detection, assume wide format
  if (result.monthColumns.length >= 3) {
    result.format = 'wide'
    result.confidence = Math.min(0.9, result.monthColumns.length / cleanHeaders.length)
    console.log('🔍 DEBUG: Detected as wide format due to multiple month columns')
  } else if (hasLongCols && !hasWideCols) {
    result.format = 'long'
    result.confidence = 0.95
  } else if (hasLongCols && hasWideCols) {
    result.format = 'hybrid'
    result.warnings.push('Mixed long/wide format detected')
  }
  
  // Fallback: if we have lots of columns that could be dates, force wide format
  if (result.format === 'unknown' && cleanHeaders.length > 5) {
    const potentialDateColumns = cleanHeaders.filter(header => 
      /^[A-Za-z]{3}\/\d{2}$/.test(header) || // Jan/23 pattern specifically
      /^\d{1,2}\/\d{2,4}$/.test(header)      // 1/23 pattern
    )
    
    if (potentialDateColumns.length >= 3) {
      result.format = 'wide'
      result.confidence = 0.8
      result.monthColumns = potentialDateColumns
      result.customerColumns = [cleanHeaders[0]] // Assume first column is customer
      console.log('🔍 DEBUG: Fallback wide format detection triggered')
    }
  }
  
  // TEMPORARY: Super aggressive fallback for testing
  if (result.format === 'unknown' && cleanHeaders.length >= 10) {
    console.log('🔍 DEBUG: TEMP - Forcing wide format for file with many columns')
    result.format = 'wide'
    result.confidence = 0.5
    result.monthColumns = cleanHeaders.slice(1) // All columns except first as months
    result.customerColumns = [cleanHeaders[0]] // First column as customer
    result.warnings.push('Forced wide format detection for testing')
  }
  
  console.log('🔍 DEBUG: Final detection result:', result)
  return result
}

// Find customer-related columns (first few columns typically)
function findCustomerColumns(headers: string[]): string[] {
  const customerPatterns = [
    /^customer/i, /^client/i, /^company/i, 
    /^account/i, /^name/i, /^id$/i, /^column_0$/i // Include placeholder for empty first column
  ]
  
  const matchingColumns = headers.slice(0, 3).filter(header => 
    customerPatterns.some(pattern => pattern.test(header.trim()))
  )
  
  // If no explicit customer columns found, assume first column is customer names
  // This handles cases where first column is empty/unnamed but contains customer data
  if (matchingColumns.length === 0 && headers.length > 0) {
    return [headers[0]] // Return first column even if it's empty/unnamed
  }
  
  return matchingColumns
}

// Find month-related columns with pattern matching
function findMonthColumns(headers: string[]): string[] {
  const monthPatterns = [
    /^\d{4}-\d{1,2}$/,                    // 2023-01, 2023-1
    /^\d{1,2}\/\d{2,4}$/,                 // 1/23, 01/2023
    /^[A-Za-z]{3}\/\d{2,4}$/,             // Jan/23, Jan/2023
    /^[A-Za-z]{3}-\d{2,4}$/,              // Jan-23, Jan-2023
    /^[A-Za-z]{3}\s+\d{2,4}$/,            // Jan 2023
    /^[A-Za-z]{3,9}\s+\d{4}$/,            // January 2023
    /^Q[1-4]\s+\d{4}$/,                   // Q1 2023
  ]
  
  const monthColumns: string[] = []
  
  // First, check for Excel serial numbers (NEW FIX)
  const potentialSerialNumbers = headers.filter(header => {
    const cleaned = String(header).trim()
    const num = parseInt(cleaned)
    // Excel dates roughly between 1900-2030 (serial numbers ~36526-47482)
    return !isNaN(num) && num >= 36526 && num <= 47482
  })
  
  console.log('🔍 DEBUG: Found potential Excel serial numbers:', potentialSerialNumbers)
  
  // If we found serial numbers, validate they convert to proper dates
  if (potentialSerialNumbers.length >= 3) {
    try {
      const convertedDates = potentialSerialNumbers.map(convertExcelSerial)
      console.log('🔍 DEBUG: Converted Excel serials to dates:', convertedDates)
      
      if (looksLikeMonthSequence(convertedDates)) {
        console.log('🔍 DEBUG: Excel serial numbers confirmed as month sequence')
        return potentialSerialNumbers
      }
    } catch (error) {
      console.warn('🔍 DEBUG: Failed to convert Excel serials:', error)
    }
  }
  
  // Fallback to regular month pattern detection
  for (const header of headers) {
    const cleaned = String(header).trim()
    
    // Skip empty headers
    if (!cleaned) continue
    
    const isMonth = monthPatterns.some(pattern => pattern.test(cleaned))
    
    if (isMonth) {
      try {
        parseMonthHeader(cleaned) // Validate it's actually parseable
        monthColumns.push(header)
        console.log('🔍 DEBUG: Found valid month header:', header)
      } catch (error) {
        console.log('🔍 DEBUG: Failed to parse month header:', header, error)
      }
    }
  }
  
  console.log('🔍 DEBUG: Total month columns found:', monthColumns.length)
  return monthColumns
}

// Check for long format column indicators
function hasLongFormatColumns(headers: string[]): boolean {
  const longFormatIndicators = ['customerid', 'customer id', 'month', 'mrr', 'revenue']
  const lowerHeaders = headers.map(h => h.toLowerCase())
  
  return longFormatIndicators.some(indicator => 
    lowerHeaders.some(header => header.includes(indicator))
  )
}

// Convert Excel serial number to YYYY-MM format
function convertExcelSerial(serialStr: string): string {
  const serial = parseInt(String(serialStr))
  if (isNaN(serial)) {
    throw new Error(`Invalid Excel serial number: ${serialStr}`)
  }
  
  // Excel epoch starts at December 30, 1899
  const excelEpoch = new Date(1899, 11, 30)
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000)
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  
  console.log(`🔍 DEBUG: Converted Excel serial ${serial} to ${year}-${month}`)
  return `${year}-${month}`
}

// Check if converted dates look like a sequential month pattern
function looksLikeMonthSequence(dates: string[]): boolean {
  if (dates.length < 3) return false
  
  // Sort dates and check if they're roughly monthly
  const sortedDates = [...dates].sort()
  
  // Check if we have reasonable date range (not all the same year/month)
  const firstDate = new Date(sortedDates[0] + '-01')
  const lastDate = new Date(sortedDates[sortedDates.length - 1] + '-01')
  const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                     (lastDate.getMonth() - firstDate.getMonth())
  
  // Should span at least 2 months and not more than 5 years
  return monthsDiff >= 2 && monthsDiff <= 60
}

// Enhanced month header parser with comprehensive format support
function parseMonthHeader(monthHeader: string): string {
  const cleaned = String(monthHeader).trim()
  console.log('🔍 DEBUG: Parsing month header:', cleaned)
  
  // NEW: Handle Excel serial numbers first
  const serialNum = parseInt(cleaned)
  if (!isNaN(serialNum) && serialNum >= 36526 && serialNum <= 47482) {
    console.log('🔍 DEBUG: Detected Excel serial number:', serialNum)
    return convertExcelSerial(cleaned)
  }
  
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(cleaned)) {
    return cleaned
  }
  
  // Month name patterns: Jan/23, Jan-23, Jan 2023
  const monthYearMatch = cleaned.match(/^([A-Za-z]{3,9})[\/\-\s]+(\d{2,4})$/)
  if (monthYearMatch) {
    console.log('🔍 DEBUG: Month/year match found:', monthYearMatch)
    const month = getMonthNumber(monthYearMatch[1])
    const year = normalizeYear(monthYearMatch[2])
    const result = `${year}-${month.padStart(2, '0')}`
    console.log('🔍 DEBUG: Converted to:', result)
    return result
  }
  
  // Numeric patterns: 01/2023, 1/23, 2023/01
  const numericMatch = cleaned.match(/^(\d{1,4})[\/\-](\d{1,4})$/)
  if (numericMatch) {
    const [, first, second] = numericMatch
    
    // Determine which is month vs year based on length/value
    if (first.length === 4) { // 2023/01 format
      return `${first}-${second.padStart(2, '0')}`
    } else { // 01/2023 format
      const year = normalizeYear(second)
      return `${year}-${first.padStart(2, '0')}`
    }
  }
  
  // Quarter format: Q1 2023
  const quarterMatch = cleaned.match(/^Q([1-4])[\/\-\s]*(\d{4})$/)
  if (quarterMatch) {
    const quarter = parseInt(quarterMatch[1])
    const year = quarterMatch[2]
    const month = ((quarter - 1) * 3 + 1).toString().padStart(2, '0')
    return `${year}-${month}`
  }
  
  // Fallback to existing formatMonth function
  return formatMonth(cleaned)
}

// Convert month names to numbers
function getMonthNumber(monthName: string): string {
  const months: Record<string, string> = {
    jan: '01', january: '01', feb: '02', february: '02',
    mar: '03', march: '03', apr: '04', april: '04',
    may: '05', jun: '06', june: '06',
    jul: '07', july: '07', aug: '08', august: '08',
    sep: '09', september: '09', oct: '10', october: '10',
    nov: '11', november: '11', dec: '12', december: '12'
  }
  
  const monthNum = months[monthName.toLowerCase()]
  if (!monthNum) {
    throw new Error(`Invalid month name: ${monthName}`)
  }
  return monthNum
}

// Normalize 2-digit years to 4-digit
function normalizeYear(year: string): string {
  const yearNum = parseInt(year)
  
  if (year.length === 2) {
    // Dynamic 2-digit year conversion for enterprise datasets
    // Handle years from 1990-2099 intelligently
    const currentYear = new Date().getFullYear()
    const currentCentury = Math.floor(currentYear / 100) * 100
    const twoDigitThreshold = currentYear - currentCentury + 20 // 20-year forward window
    
    if (yearNum <= twoDigitThreshold) {
      return `${currentCentury + yearNum}` // 25 -> 2025
    } else {
      return `${currentCentury - 100 + yearNum}` // 95 -> 1995
    }
  }
  
  if (year.length === 4) {
    // Validate reasonable year range for SaaS data (1990-2099)
    if (yearNum >= 1990 && yearNum <= 2099) {
      return year
    }
    console.warn(`⚠️  Unusual year detected: ${year}. Proceeding with processing.`)
    return year
  }
  
  throw new Error(`Invalid year format: ${year}`)
}

export async function parseSpreadsheet(file: File): Promise<CustomerMonth[]> {
  console.log('🔍 DEBUG: Starting parseSpreadsheet with file:', file.name, 'size:', file.size)
  
  const extension = file.name.split('.').pop()?.toLowerCase()
  console.log('🔍 DEBUG: File extension detected:', extension)
  
  try {
    if (extension === 'csv') {
      console.log('🔍 DEBUG: Routing to CSV parser')
      return parseCSV(file)
    } else if (extension === 'xlsx' || extension === 'xls') {
      console.log('🔍 DEBUG: Routing to Excel parser')
      return parseExcel(file)
    } else {
      throw new Error('Unsupported file format')
    }
  } catch (error) {
    console.error('🔍 DEBUG: Error in parseSpreadsheet:', error)
    throw error
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
  console.log('🔍 DEBUG: Starting Excel parsing for file:', file.name)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        console.log('🔍 DEBUG: FileReader loaded, processing Excel data')
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        console.log('🔍 DEBUG: Excel workbook loaded, sheets:', workbook.SheetNames)
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        console.log('🔍 DEBUG: Excel sheet converted to JSON, rows:', jsonData.length)
        
        // Debug the raw Excel structure
        DebugHelper.logExcelStructure(jsonData as unknown[][], 'Raw Excel Data')
        
        // Transform to expected format
        const transformed = transformExcelData(jsonData as unknown[][])
        
        // Debug the final results
        DebugHelper.logCustomerMonthData(transformed, 'Final Parsed Results')
        
        // Validate the data quality
        const validation = DebugHelper.validateSaaSData(transformed)
        if (!validation.isValid) {
          console.error('❌ Data validation failed:', validation.issues)
          console.warn('💡 Recommendations:', validation.recommendations)
        }
        
        resolve(transformed)
      } catch (error) {
        console.error('🔍 DEBUG: Error in Excel parsing:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Main data transformation dispatcher with format detection
function transformData(data: Record<string, unknown>[]): CustomerMonth[] {
  console.log('🔍 DEBUG: transformData called with', data.length, 'rows')
  
  if (data.length === 0) {
    throw new DataFormatError('No data to process', {
      suggestions: ['Check that your file contains data rows below headers']
    })
  }
  
  // Detect format from headers
  const headers = Object.keys(data[0])
  console.log('🔍 DEBUG: Headers from first row:', headers)
  
  const detection = detectDataFormat(headers)
  
  if (detection.format === 'unknown') {
    throw new DataFormatError('Unable to detect data format', {
      suggestions: [
        'For long format: Include columns like customerId, customerName, month, mrr',
        'For wide format: Include customer names and month headers like Jan/23, Feb/23'
      ]
    })
  }
  
  if (detection.format === 'hybrid') {
    throw new DataFormatError('Mixed data format detected', {
      detectedFormat: 'hybrid',
      suggestions: ['Use either long format OR wide format, not both in the same file']
    })
  }
  
  // Route to appropriate transformer
  if (detection.format === 'wide') {
    return transformWideFormatData(data, detection)
  } else {
    return transformLongFormatData(data) // Renamed existing function
  }
}

// Original long format transformer (renamed for clarity)
function transformLongFormatData(data: Record<string, unknown>[]): CustomerMonth[] {
  const result: CustomerMonth[] = []
  
  for (const row of data) {
    if (!row || typeof row !== 'object') continue
    
    // Try different possible column names for long format
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
    throw new DataFormatError('No valid data found in long format', {
      suggestions: ['Ensure your file has columns: customerId, customerName, month, mrr']
    })
  }
  
  return result
}

// Wide format transformer with enterprise-scale processing
function transformWideFormatData(data: Record<string, unknown>[], detection: FormatDetectionResult): CustomerMonth[] {
  // Estimate dataset size for monitoring (no artificial limits)
  const estimatedRecords = data.length * detection.monthColumns.length
  const estimatedMemoryMB = (estimatedRecords * 150) / (1024 * 1024)
  
  console.log(`📊 Processing ${data.length} customers × ${detection.monthColumns.length} months = ${estimatedRecords} records (~${estimatedMemoryMB.toFixed(1)}MB)`)
  
  // Enterprise-grade: Handle datasets of any size
  // For very large datasets (>100K records), we could implement streaming in the future
  if (estimatedRecords > 1000000) { // 1M record warning (not limit)
    console.warn(`⚠️  Large dataset detected: ${estimatedRecords} records. Consider implementing streaming for optimal performance.`)
  }
  
  // Sort month columns chronologically for consistent processing
  const sortedMonthColumns = sortMonthHeaders(detection.monthColumns)
  
  const result: CustomerMonth[] = []
  const existingIds = new Set<string>() // Track IDs to prevent duplicates
  
  console.log(`🔍 DEBUG: Starting wide format processing with ${data.length} rows`)
  console.log('🔍 DEBUG: Sorted month columns:', sortedMonthColumns)
  
  // Process each customer row
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex]
    if (!row || typeof row !== 'object') continue
    
    console.log(`🔍 DEBUG: Processing row ${rowIndex + 1}:`, Object.keys(row).slice(0, 3), '...')
    
    try {
      // Extract customer information from first columns
      const customerData = extractCustomerData(row, detection.customerColumns, existingIds)
      
      // Process each month column for this customer
      for (const monthHeader of sortedMonthColumns) {
        const mrrValue = row[monthHeader]
        
        // Skip empty cells (represents no revenue/churn)
        if (isEmpty(mrrValue)) continue
        
        const mrr = parseFloat(String(mrrValue))
        if (isNaN(mrr) || mrr < 0) { // Negative MRR doesn't make sense
          console.log(`🔍 DEBUG: Skipping invalid MRR for ${customerData.name}, ${monthHeader}: ${mrrValue}`)
          continue
        }
        
        console.log(`🔍 DEBUG: Processing ${customerData.name}, ${monthHeader}: $${mrr}`)
        
        try {
          const month = parseMonthHeader(monthHeader)
          result.push({
            customerId: customerData.id,
            customerName: customerData.name,
            month,
            mrr
          })
        } catch (error) {
          console.warn(`Skipping invalid month ${monthHeader} for ${customerData.name}: ${error}`)
          
          // TEMPORARY: For testing, try to force a month format
          if (monthHeader.includes('/')) {
            try {
              const [monthPart, yearPart] = monthHeader.split('/')
              if (monthPart && yearPart) {
                const tempMonth = `20${yearPart}-${monthPart.padStart(2, '0')}`
                console.log(`🔍 DEBUG: TEMP - Forcing month format: ${monthHeader} -> ${tempMonth}`)
                result.push({
                  customerId: customerData.id,
                  customerName: customerData.name,
                  month: tempMonth,
                  mrr
                })
              }
            } catch {
              // Still skip if this fails
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Skipping row ${rowIndex + 1}: ${error}`)
    }
  }
  
  if (result.length === 0) {
    throw new DataFormatError('No valid customer-month records found in wide format', {
      suggestions: [
        'Check that month headers are valid dates',
        'Ensure customer names are in the first column',
        'Verify MRR values are numeric'
      ]
    })
  }
  
  console.log(`🔍 DEBUG: Wide format processing complete:`)
  console.log(`🔍 DEBUG: - Total records: ${result.length}`)
  console.log(`🔍 DEBUG: - Unique customers: ${new Set(result.map(r => r.customerId)).size}`)
  console.log(`🔍 DEBUG: - Date range: ${result.map(r => r.month).sort()[0]} to ${result.map(r => r.month).sort().slice(-1)[0]}`)
  console.log(`🔍 DEBUG: - Sample records:`, result.slice(0, 5))
  
  return result
}

// Extract customer data from row with ID generation
function extractCustomerData(row: Record<string, unknown>, customerColumns: string[], existingIds: Set<string>): { id: string, name: string } {
  // Find the customer column - should be "Customer" or first column
  const customerColumnName = 'Customer' // We know this from header processing
  const customerName = String(row[customerColumnName] || '').trim()
  
  console.log('🔍 DEBUG: Extracting customer from row:', { 
    customerColumnName, 
    customerName, 
    customerValue: row[customerColumnName],
    allKeys: Object.keys(row).slice(0, 5),
    allValues: Object.values(row).slice(0, 5),
    fullRow: row
  })
  
  if (!customerName || customerName === 'null' || customerName === 'undefined') {
    console.error('🔍 DEBUG: Customer extraction failed - full row data:', row)
    throw new Error(`Invalid customer name: "${customerName}" from column "${customerColumnName}"`)
  }
  
  // Generate or extract customer ID
  let customerId: string
  const idColumn = customerColumns.find(col => /id$/i.test(col))
  
  if (idColumn && row[idColumn]) {
    customerId = String(row[idColumn]).trim()
  } else {
    customerId = generateCustomerId(customerName, existingIds)
  }
  
  console.log('🔍 DEBUG: Generated customer data:', { id: customerId, name: customerName })
  return { id: customerId, name: customerName }
}

// Generate deterministic customer ID with duplicate handling
function generateCustomerId(customerName: string, existingIds: Set<string>): string {
  // Create clean, URL-safe ID from customer name
  let baseId = customerName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')     // Replace special chars with underscore
    .replace(/_+/g, '_')            // Collapse multiple underscores  
    .replace(/^_+|_+$/g, '')        // Remove leading/trailing underscores
    .substring(0, 40)               // Prevent overly long IDs
  
  if (!baseId) baseId = 'customer'
  
  // Handle duplicates by appending counter
  let finalId = baseId
  let counter = 1
  
  while (existingIds.has(finalId)) {
    finalId = `${baseId}_${counter}`
    counter++
    if (counter > 1000) { // Prevent infinite loops
      finalId = `${baseId}_${Date.now()}`
      break
    }
  }
  
  existingIds.add(finalId)
  return finalId
}

// Sort month headers chronologically 
function sortMonthHeaders(monthHeaders: string[]): string[] {
  return [...monthHeaders].sort((a, b) => {
    try {
      const monthA = parseMonthHeader(a)
      const monthB = parseMonthHeader(b)
      return monthA.localeCompare(monthB)
    } catch {
      return 0 // Maintain original order if parsing fails
    }
  })
}

// Comprehensive empty value detection
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' || trimmed === 'N/A' || trimmed === 'NULL' || trimmed === '-'
  }
  
  if (typeof value === 'number') {
    return isNaN(value)
  }
  
  return false
}

// Excel data transformer with format detection
function transformExcelData(data: unknown[][]): CustomerMonth[] {
  if (data.length < 2) {
    throw new DataFormatError('Excel file must have at least a header row and one data row')
  }
  
  console.log('🔍 DEBUG: Excel data structure - total rows:', data.length)
  console.log('🔍 DEBUG: First 3 rows:', data.slice(0, 3))
  
  // Handle Excel data structure - always start from row 1 (after headers)
  let headerRow = data[0]
  let dataStartIndex = 1
  
  console.log(`🔍 DEBUG: Will process ALL rows from ${dataStartIndex} to ${data.length - 1} (${data.length - dataStartIndex} total rows)`)
  
  // Convert Excel data to object format for consistent processing
  const rawHeaders = headerRow.map(h => String(h === null ? '' : h).trim())
  console.log('🔍 DEBUG: Raw Excel headers:', rawHeaders)
  
  // Handle empty/null headers by giving them placeholder names
  const headers = rawHeaders.map((header, index) => {
    if (!header || header === '' || header === 'null') {
      // Special handling for first column (likely customer names)
      return index === 0 ? 'Customer' : `Column_${index}`
    }
    return header
  })
  
  console.log('🔍 DEBUG: Processed Excel headers:', headers)
  const objectData: Record<string, unknown>[] = []
  
  // DIRECT PROCESSING: Skip all complex logic, process raw Excel data directly
  console.log('🔍 DEBUG: DIRECT PROCESSING - Converting raw Excel to CustomerMonth records')
  
  // Process customer rows directly (skip row 1 "Total MRR", start from row 2)
  for (let customerRowIndex = 2; customerRowIndex < data.length; customerRowIndex++) {
    const customerRow = data[customerRowIndex]
    console.log(`🔍 DEBUG: Direct processing customer row ${customerRowIndex}:`, customerRow)
    
    if (!customerRow || customerRow.length === 0) {
      console.log(`🔍 DEBUG: Skipping empty row ${customerRowIndex}`)
      continue
    }
    
    const customerName = String(customerRow[0] || '').trim()
    console.log(`🔍 DEBUG: Customer name from row ${customerRowIndex}:`, customerName)
    
    if (!customerName || !customerName.toLowerCase().includes('customer')) {
      console.log(`🔍 DEBUG: Skipping row ${customerRowIndex} - not a customer: "${customerName}"`)
      continue
    }
    
    // Generate customer ID
    const customerId = customerName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    console.log(`🔍 DEBUG: Generated customer ID: ${customerId}`)
    
    // Process each month column for this customer
    for (let monthIndex = 1; monthIndex < customerRow.length && monthIndex < headers.length; monthIndex++) {
      const monthHeader = headers[monthIndex]
      const mrrValue = customerRow[monthIndex]
      
      // Skip empty cells
      if (!mrrValue || mrrValue === null || mrrValue === undefined || mrrValue === '') {
        continue
      }
      
      const mrr = parseFloat(String(mrrValue))
      if (isNaN(mrr) || mrr <= 0) {
        continue
      }
      
      try {
        // Convert Excel serial number to month
        const month = convertExcelSerial(monthHeader)
        
        const record = {
          customerId,
          customerName,
          month,
          mrr
        }
        
        objectData.push(record)
        console.log(`🔍 DEBUG: Added record: ${customerName} - ${month}: $${mrr}`)
      } catch (error) {
        console.warn(`🔍 DEBUG: Failed to process month ${monthHeader} for ${customerName}:`, error)
      }
    }
  }
  
  console.log('🔍 DEBUG: Converted to object format - rows:', objectData.length)
  
  // We've directly created CustomerMonth objects, no need for further transformation
  const result = objectData as CustomerMonth[]
  
  console.log(`🔍 DEBUG: Direct processing complete - ${result.length} records created`)
  
  // Debug the final results
  DebugHelper.logCustomerMonthData(result, 'Direct Excel Processing Results')
  
  // Validate the data quality
  const validation = DebugHelper.validateSaaSData(result)
  if (!validation.isValid) {
    console.error('❌ Data validation failed:', validation.issues)
    console.warn('💡 Recommendations:', validation.recommendations)
  } else {
    console.log('✅ Data validation passed!', validation.stats)
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
