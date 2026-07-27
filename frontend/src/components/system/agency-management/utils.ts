export const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export const PLAN_COLORS: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-800',
  pro: 'bg-green-100 text-green-800',
  enterprise: 'bg-purple-100 text-purple-800',
};

export const getPlanColor = (plan: string) => PLAN_COLORS[plan] || 'bg-gray-100 text-gray-800';
