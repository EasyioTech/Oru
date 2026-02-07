/**
 * Breadcrumb trail (from config + pathname).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '../config/breadcrumbs';

interface HeaderBreadcrumbsProps {
  breadcrumbs: BreadcrumbItemType[];
  /** When true, show only last crumb (e.g. on mobile) */
  compact?: boolean;
}

export function HeaderBreadcrumbs({ breadcrumbs, compact }: HeaderBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  if (compact && breadcrumbs.length > 1) {
    const parent = breadcrumbs.slice(0, -1).slice(-1)[0];
    return (
      <Breadcrumb className="block">
        <BreadcrumbList className="text-[10px]">
          <BreadcrumbItem className="max-w-[120px] truncate">
            <BreadcrumbLink asChild>
              <Link
                to={parent.path}
                className="text-muted-foreground hover:text-foreground truncate transition-colors"
              >
                {parent.label}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const crumbsToShow = compact ? breadcrumbs.slice(-1) : breadcrumbs.slice(0, -1);
  if (crumbsToShow.length === 0) return null;

  return (
    <Breadcrumb className="block">
      <BreadcrumbList className={compact ? 'text-[10px]' : 'flex-wrap max-w-full text-xs'}>
        {crumbsToShow.map((crumb, index) => (
          <React.Fragment key={`${crumb.path}-${index}`}>
            <BreadcrumbItem
              className={compact ? 'max-w-[120px] truncate' : 'max-w-[100px] md:max-w-[150px] truncate'}
            >
              <BreadcrumbLink asChild>
                <Link
                  to={crumb.path}
                  className="text-muted-foreground hover:text-foreground truncate transition-colors"
                >
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < crumbsToShow.length - 1 && (
              <BreadcrumbSeparator className="h-3 w-3" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
