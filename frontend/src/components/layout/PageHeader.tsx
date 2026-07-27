import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — responsive page-level heading.
 *
 * Mobile  (<sm): title stacks above actions (full-width column)
 * Desktop (sm+): title left, actions right on same row
 *
 * Title scales:  text-xl  → sm:text-2xl
 * Actions get:   w-full sm:w-auto, so buttons stretch on mobile if needed
 */
export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        // Stack on mobile, side-by-side on sm+
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className
      )}
    >
      {/* Text block */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};