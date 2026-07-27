export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'destructive' as const;
    case 'medium': return 'default' as const;
    case 'low': return 'secondary' as const;
    default: return 'outline' as const;
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'destructive' as const;
    case 'in_progress': return 'default' as const;
    case 'resolved': return 'default' as const;
    case 'closed': return 'secondary' as const;
    default: return 'secondary' as const;
  }
}
