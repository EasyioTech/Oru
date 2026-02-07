import { DatabaseHealthCard } from './DatabaseHealthCard';
import { RedisHealthCard } from './RedisHealthCard';
import type { SystemHealth } from './types';

interface ServicesHealthGridProps {
  health: SystemHealth;
}

export const ServicesHealthGrid = ({ health }: ServicesHealthGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DatabaseHealthCard health={health} showPool={false} title="Database Service" />
      <RedisHealthCard health={health} />
    </div>
  );
};
