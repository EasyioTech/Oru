import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getTransactionIcon(type: string) {
  return type === 'credit'
    ? <ArrowUpRight className="h-4 w-4 text-green-600" />
    : <ArrowDownRight className="h-4 w-4 text-red-600" />;
}

export function getTransactionColor(type: string): string {
  return type === 'credit' ? 'text-green-600' : 'text-red-600';
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'revenue': return 'bg-green-100 text-green-800';
    case 'operating expenses': return 'bg-red-100 text-red-800';
    case 'payroll': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function safeDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString(); } catch { return 'Invalid Date'; }
}
