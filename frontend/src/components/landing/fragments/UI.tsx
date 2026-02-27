import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  icon,
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 relative overflow-hidden group';

  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]',
    secondary: 'bg-secondary text-foreground border border-border hover:bg-muted active:scale-[0.98]',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
    outline: 'bg-transparent text-foreground border border-border hover:bg-muted active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-[13px] px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-[14px] px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-[15px] px-6 py-3.5 rounded-lg gap-2',
  };

  const styles = cn(baseStyles, variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className);

  if (href) {
    return (
      <Link to={href} className={styles}>
        {children}
        {icon && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={styles}>
      {children}
      {icon && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
    </button>
  );
}

export function Badge({
  children,
  variant = 'default',
  className
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}) {
  const variants = {
    default: 'border-border bg-secondary/50 text-muted-foreground',
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-primary tracking-[0.1em] uppercase mb-4">
      {children}
    </p>
  );
}

interface SectionTitleProps {
  children?: ReactNode;
  className?: string;
  badge?: string;
  title?: string;
  description?: string;
}

export function SectionTitle({ children, className, badge, title, description }: SectionTitleProps) {
  if (badge || title || description) {
    return (
      <div className={cn('text-center space-y-4', className)}>
        {badge && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-2">
            {badge}
          </span>
        )}
        {title && (
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight leading-[1.1]">
            {title}
          </h2>
        )}
        {description && (
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <h2 className={cn(
      'text-[32px] md:text-[44px] font-semibold tracking-[-0.03em] leading-tight text-foreground',
      className
    )}>
      {children}
    </h2>
  );
}

export function SectionDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[17px] text-muted-foreground leading-relaxed', className)}>
      {children}
    </p>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('max-w-[1240px] mx-auto px-6', className)}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  dark = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-24 md:py-32 bg-background',
        dark && 'dark bg-background',
        className
      )}
    >
      {children}
    </section>
  );
}
