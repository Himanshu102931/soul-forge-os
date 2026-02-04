/**
 * CSV utilities for stringifying and parsing CSV data.
 * Supports multi-entity CSVs with a `table_type` column.
 */

/**
 * Escapes a value for CSV output (handles commas, quotes, newlines).
 * Converts arrays to pipe-separated values for round-trip compatibility.
 */
export function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Convert arrays to pipe-separated values (for arrays like frequency_days)
  if (Array.isArray(value)) {
    const str = value.join('|');
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  
  const str = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Converts an array of objects to CSV string.
 * If any object has a `table_type` field, it will be included as the first column.
 */
export function stringifyCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '';
  }

  // Determine all unique keys across all rows
  const allKeys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach(key => allKeys.add(key));
  }

  // Sort keys: table_type first if present, then alphabetically
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    if (a === 'table_type') return -1;
    if (b === 'table_type') return 1;
    return a.localeCompare(b);
  });

  // Generate header row
  const header = sortedKeys.map(escapeCSVValue).join(',');

  // Generate data rows
  const dataRows = rows.map(row => {
    return sortedKeys.map(key => escapeCSVValue(row[key])).join(',');
  });

  return [header, ...dataRows].join('\n');
}

/**
 * Parses a CSV string into an array of objects.
 * Handles quoted values, escaped quotes, etc.
 */
export function parseCSVToObjects(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  const result: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(cell => !cell)) continue;

    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] || '';
    }
    result.push(obj);
  }

  return result;
}

/**
 * Converts a date string to ISO format (YYYY-MM-DD).
 */
export function toISODate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Converts a string to boolean (yes, true, 1 → true).
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['yes', 'true', '1', 'y', 't'].includes(value.toLowerCase());
  }
  return !!value;
}

/**
 * Safely parse an integer with fallback.
 */
export function toInt(value: unknown, fallback: number = 0): number {
  const num = parseInt(String(value), 10);
  return isNaN(num) ? fallback : num;
}

/**
 * Safely parse a float with fallback.
 */
export function toFloat(value: unknown, fallback: number = 0): number {
  const num = parseFloat(String(value));
  return isNaN(num) ? fallback : num;
}
