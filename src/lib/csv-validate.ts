// CSV validation with row-level error reporting
// Implements Step 5 from the SaaSGrid improvement plan

import { parse } from 'papaparse';

export interface RowError {
  row: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: RowError[];
  warnings: RowError[];
  rows: any[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

/**
 * Validate CSV data with comprehensive row-level error reporting
 * @param text CSV content as string
 * @param options Validation options
 * @returns Detailed validation result
 */
export function validateCsv(
  text: string,
  options: {
    requiredColumns?: string[];
    optionalColumns?: string[];
    allowExtraColumns?: boolean;
  } = {}
): ValidationResult {
  const {
    requiredColumns = ['month', 'mrr'],
    optionalColumns = ['customers', 'new_mrr', 'expansion_mrr', 'contraction_mrr', 'churned_mrr'],
    allowExtraColumns = true
  } = options;

  const errors: RowError[] = [];
  const warnings: RowError[] = [];
  const validRows: any[] = [];

  // Parse CSV
  const parseResult = parse(text, { 
    header: true, 
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase()
  });

  if (parseResult.errors.length > 0) {
    parseResult.errors.forEach((error, index) => {
      errors.push({
        row: error.row || 0,
        message: `Parse error: ${error.message}`,
        severity: 'error'
      });
    });
  }

  const data = parseResult.data as any[];
  if (data.length === 0) {
    errors.push({
      row: 0,
      message: 'No data found in CSV file',
      severity: 'error'
    });
    
    return {
      isValid: false,
      errors,
      warnings,
      rows: [],
      summary: {
        totalRows: 0,
        validRows: 0,
        errorRows: 1,
        warningRows: 0
      }
    };
  }

  // Check headers
  const headers = Object.keys(data[0] || {});
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  // Validate required columns
  for (const required of requiredColumns) {
    if (!normalizedHeaders.includes(required.toLowerCase())) {
      errors.push({
        row: 0,
        column: required,
        message: `Missing required column: ${required}`,
        severity: 'error'
      });
    }
  }

  // Check for unexpected columns
  if (!allowExtraColumns) {
    const allowedColumns = [...requiredColumns, ...optionalColumns].map(c => c.toLowerCase());
    for (const header of normalizedHeaders) {
      if (!allowedColumns.includes(header)) {
        warnings.push({
          row: 0,
          column: header,
          message: `Unexpected column: ${header}`,
          severity: 'warning'
        });
      }
    }
  }

  // Validate each row
  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // Account for header row + 1-based indexing
    const rowErrors: RowError[] = [];
    const processedRow: any = {};

    // Validate month
    if (row.month) {
      const monthStr = String(row.month).trim();
      
      // Try to parse various month formats
      if (/^\d{4}-\d{2}$/.test(monthStr)) {
        // YYYY-MM format (preferred)
        processedRow.month = monthStr + '-01';
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(monthStr)) {
        // YYYY-MM-DD format
        processedRow.month = monthStr.slice(0, 7) + '-01';
      } else if (/^\d{1,2}\/\d{4}$/.test(monthStr)) {
        // MM/YYYY format
        const [month, year] = monthStr.split('/');
        processedRow.month = `${year}-${month.padStart(2, '0')}-01`;
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(monthStr)) {
        // MM/DD/YYYY format
        const [month, , year] = monthStr.split('/');
        processedRow.month = `${year}-${month.padStart(2, '0')}-01`;
      } else {
        rowErrors.push({
          row: rowNumber,
          column: 'month',
          message: 'Invalid month format. Expected YYYY-MM, MM/YYYY, or similar',
          severity: 'error'
        });
      }
    } else {
      rowErrors.push({
        row: rowNumber,
        column: 'month',
        message: 'Month is required',
        severity: 'error'
      });
    }

    // Validate MRR
    if (row.mrr !== undefined && row.mrr !== null && row.mrr !== '') {
      const mrrValue = Number(row.mrr);
      if (isNaN(mrrValue)) {
        rowErrors.push({
          row: rowNumber,
          column: 'mrr',
          message: 'MRR must be a valid number',
          severity: 'error'
        });
      } else if (mrrValue < 0) {
        rowErrors.push({
          row: rowNumber,
          column: 'mrr',
          message: 'MRR cannot be negative',
          severity: 'error'
        });
      } else {
        processedRow.mrr = mrrValue;
      }
    } else {
      rowErrors.push({
        row: rowNumber,
        column: 'mrr',
        message: 'MRR is required',
        severity: 'error'
      });
    }

    // Validate optional numeric fields
    const numericFields = ['customers', 'new_mrr', 'expansion_mrr', 'contraction_mrr', 'churned_mrr'];
    for (const field of numericFields) {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        const value = Number(row[field]);
        if (isNaN(value)) {
          rowErrors.push({
            row: rowNumber,
            column: field,
            message: `${field} must be a valid number`,
            severity: 'error'
          });
        } else if (value < 0) {
          rowErrors.push({
            row: rowNumber,
            column: field,
            message: `${field} cannot be negative`,
            severity: 'error'
          });
        } else {
          processedRow[field] = value;
        }
      }
    }

    // Validate customers specifically
    if (row.customers !== undefined && row.customers !== null && row.customers !== '') {
      const customerCount = Number(row.customers);
      if (!isNaN(customerCount) && customerCount !== Math.floor(customerCount)) {
        warnings.push({
          row: rowNumber,
          column: 'customers',
          message: 'Customer count should be a whole number',
          severity: 'warning'
        });
      }
    }

    // Business logic validations
    if (processedRow.mrr && processedRow.new_mrr && processedRow.expansion_mrr && 
        processedRow.contraction_mrr && processedRow.churned_mrr) {
      // Check if MRR components add up reasonably
      const totalChanges = (processedRow.new_mrr || 0) + (processedRow.expansion_mrr || 0) - 
                          (processedRow.contraction_mrr || 0) - (processedRow.churned_mrr || 0);
      
      if (Math.abs(totalChanges) > processedRow.mrr * 2) {
        warnings.push({
          row: rowNumber,
          message: 'MRR components seem unusually large compared to total MRR',
          severity: 'warning'
        });
      }
    }

    // If row has errors, add them to the main errors array
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      // Row is valid, add to processed rows
      validRows.push(processedRow);
    }
  });

  const summary = {
    totalRows: data.length,
    validRows: validRows.length,
    errorRows: data.length - validRows.length,
    warningRows: warnings.filter(w => w.row > 0).length
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rows: validRows,
    summary
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string[] {
  const messages: string[] = [];
  
  // Add error messages
  result.errors.forEach(error => {
    const location = error.row === 0 ? 'Header' : `Row ${error.row}`;
    const column = error.column ? ` (${error.column})` : '';
    messages.push(`${location}${column}: ${error.message}`);
  });
  
  // Add warning messages
  result.warnings.forEach(warning => {
    const location = warning.row === 0 ? 'Header' : `Row ${warning.row}`;
    const column = warning.column ? ` (${warning.column})` : '';
    messages.push(`Warning - ${location}${column}: ${warning.message}`);
  });
  
  return messages;
}

/**
 * Check if the CSV has the expected SaaS metrics structure
 */
export function detectCsvType(text: string): 'basic' | 'detailed' | 'unknown' {
  const parseResult = parse(text, { header: true, preview: 1 });
  
  if (parseResult.errors.length > 0 || !parseResult.data.length) {
    return 'unknown';
  }
  
  const headers = Object.keys(parseResult.data[0] || {}).map(h => h.trim().toLowerCase());
  
  const hasBasicFields = headers.includes('month') && headers.includes('mrr');
  const hasDetailedFields = headers.some(h => 
    ['new_mrr', 'expansion_mrr', 'contraction_mrr', 'churned_mrr'].includes(h)
  );
  
  if (hasBasicFields && hasDetailedFields) {
    return 'detailed';
  } else if (hasBasicFields) {
    return 'basic';
  } else {
    return 'unknown';
  }
}
