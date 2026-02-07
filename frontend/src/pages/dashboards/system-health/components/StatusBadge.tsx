import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'connected':
    case 'ok':
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    case 'degraded':
    case 'unavailable':
      return (
        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
          <AlertCircle className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    case 'error':
    case 'disconnected':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    default:
      return <Badge>{status || 'Unknown'}</Badge>;
  }
};
