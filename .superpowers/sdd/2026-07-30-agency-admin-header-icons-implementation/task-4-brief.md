# Task 4: Create useHealthAlerts Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useHealthAlerts.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1), TanStack Query
- Produces:
  - `useHealthAlerts(): { healthScore, status, alerts, actionItems, isLoading }`
  - Return type: `{ healthScore: number, status: HealthStatus, alerts: HealthAlert[], actionItems: ActionItem[], isLoading: boolean, error: unknown }`

**Complete Implementation:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardStore, HealthAlert } from '../stores/dashboardStore';

export interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  db: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
}

export interface ActionItem {
  title: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
}

export function useHealthAlerts() {
  const setHealthAlerts = dashboardStore((state) => state.setHealthAlerts);

  const { data, isLoading, error } = useQuery({
    queryKey: ['agencyHealth'],
    queryFn: async () => {
      const response = await fetch('/api/agency/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30s
    staleTime: 25000,
  });

  // Sync alerts to store
  if (data?.alerts) {
    setHealthAlerts(data.alerts);
  }

  return {
    healthScore: data?.score ?? 0,
    status: data?.status ?? { api: 'down', db: 'down', redis: 'down' },
    alerts: data?.alerts ?? [],
    actionItems: data?.actionItems ?? [],
    isLoading,
    error,
  };
}
```

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/hooks/useHealthAlerts.ts`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add useHealthAlerts hook with 30s polling
```

**Success criteria:**
- File created at correct path
- Hook imports correctly from dashboardStore (Task 1)
- Hook returns all 6 required properties (healthScore, status, alerts, actionItems, isLoading, error)
- Two exported interfaces: HealthStatus and ActionItem
- useQuery configured with 30s refetchInterval and 25s staleTime
- Sync to dashboardStore via setHealthAlerts
- TypeScript compiles with no errors
