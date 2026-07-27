import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'normal': return <Info className="w-4 h-4 text-blue-500" />;
    case 'low': return <Info className="w-4 h-4 text-gray-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
}

export function getCategoryColor(category: string) {
  switch (category) {
    case 'approval': return 'bg-yellow-100 text-yellow-800';
    case 'reminder': return 'bg-blue-100 text-blue-800';
    case 'update': return 'bg-green-100 text-green-800';
    case 'alert': return 'bg-red-100 text-red-800';
    case 'system': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
