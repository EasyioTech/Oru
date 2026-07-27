export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseIndianDate(dateStr: string): Date | null {
  if (!dateStr.trim()) return null;
  const digits = dateStr.replace(/\D/g, '');
  if (digits.length < 6) return null;

  const day = parseInt(digits.slice(0, 2));
  const month = parseInt(digits.slice(2, 4));
  let year = parseInt(digits.slice(4));

  if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return null;

  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return null;
  return date;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
