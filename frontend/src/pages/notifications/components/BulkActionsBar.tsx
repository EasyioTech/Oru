import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash2 } from 'lucide-react';

interface Props {
  count: number;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

export function BulkActionsBar({ count, onMarkAsRead, onDelete }: Props) {
  if (count === 0) return null;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{count} notification(s) selected</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onMarkAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />Mark as Read
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
