/**
 * Checks if a string is a valid date
 * @param dateString Date string to validate
 * @returns True if valid date, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Formats a date object to a readable string
 * @param date The date to format
 * @returns Formatted date string (e.g., "Monday, January 1, 2023")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Gets the current date formatted as YYYY-MM-DD
 * @returns Current date in YYYY-MM-DD format
 */
export function getCurrentDateFormatted(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date
 * @param date Base date
 * @param days Number of days to add
 * @returns New date with added days
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get a date range for the next N days
 * @param days Number of days to include
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getDateRangeForNextDays(days: number): string[] {
  const dates: string[] = [];
  let currentDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    dates.push(`${year}-${month}-${day}`);
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
} 