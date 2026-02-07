export const getColorClasses = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'h-6 w-6 text-blue-600 dark:text-blue-400',
    green: 'h-6 w-6 text-green-600 dark:text-green-400',
    purple: 'h-6 w-6 text-purple-600 dark:text-purple-400',
    orange: 'h-6 w-6 text-orange-600 dark:text-orange-400',
    indigo: 'h-6 w-6 text-indigo-600 dark:text-indigo-400',
    pink: 'h-6 w-6 text-pink-600 dark:text-pink-400',
    teal: 'h-6 w-6 text-teal-600 dark:text-teal-400',
    cyan: 'h-6 w-6 text-cyan-600 dark:text-cyan-400',
    violet: 'h-6 w-6 text-violet-600 dark:text-violet-400',
    amber: 'h-6 w-6 text-amber-600 dark:text-amber-400',
    emerald: 'h-6 w-6 text-emerald-600 dark:text-emerald-400',
    rose: 'h-6 w-6 text-rose-600 dark:text-rose-400',
    slate: 'h-6 w-6 text-slate-600 dark:text-slate-400'
  };
  return colorMap[color] || 'h-6 w-6 text-gray-600 dark:text-gray-400';
};

export const getIconBgClasses = (color: string): string => {
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
    teal: 'bg-teal-50 dark:bg-teal-900/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
    violet: 'bg-violet-50 dark:bg-violet-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
    rose: 'bg-rose-50 dark:bg-rose-900/20',
    slate: 'bg-slate-50 dark:bg-slate-900/20'
  };
  return bgMap[color] || 'bg-gray-50 dark:bg-gray-900/20';
};

export const getCategoryBadgeColor = (category: string): string => {
  switch (category) {
    case 'Financial': return 'bg-green-100 text-green-800';
    case 'HR': return 'bg-blue-100 text-blue-800';
    case 'Project': return 'bg-purple-100 text-purple-800';
    case 'Custom': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
