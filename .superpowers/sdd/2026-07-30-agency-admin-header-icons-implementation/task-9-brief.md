# Task 9: Create HealthAlert Component

**Files:**
- Create: `frontend/src/modules/core/components/HealthAlert.tsx`

**Interfaces:**
- Consumes: `useHealthAlerts` hook (from Task 4), Popover (shadcn/ui), lucide-react icons (AlertCircle, CheckCircle, Clock)
- Produces: React component `<HealthAlert />` (no props)
  - Renders: Status icon button + popover with alerts list
  - Read-only display of agency health alerts
  - Shows alert count badge when alerts exist

**Complete Implementation:**

```typescript
import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useHealthAlerts } from '../hooks/useHealthAlerts';

type AlertIcon = React.ReactNode;

function getAlertIcon(type: string): AlertIcon {
  switch (type) {
    case 'critical':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'info':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
}

function getAlertBgColor(type: string): string {
  switch (type) {
    case 'critical':
      return 'bg-red-50';
    case 'warning':
      return 'bg-yellow-50';
    case 'info':
      return 'bg-blue-50';
    default:
      return 'bg-green-50';
  }
}

export function HealthAlert() {
  const [open, setOpen] = useState(false);
  const { alerts } = useHealthAlerts();

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  const hasIssues = criticalCount > 0 || warningCount > 0;
  const statusColor = criticalCount > 0 ? 'text-red-500' : warningCount > 0 ? 'text-yellow-500' : 'text-green-500';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-colors ${
            hasIssues ? 'hover:border-red-300' : 'hover:border-gray-300'
          }`}
          aria-label="Health Status"
        >
          <CheckCircle className={`w-4 h-4 ${statusColor}`} />
          {hasIssues && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {criticalCount + warningCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col max-h-96">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">
              Agency Health Status
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {alerts.length === 0
                ? 'All systems operational'
                : `${criticalCount} critical, ${warningCount} warning`}
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Everything is running smoothly</p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`px-4 py-3 border-b border-gray-100 last:border-0 ${getAlertBgColor(alert.type)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/HealthAlert.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Add export to barrel (`frontend/src/modules/core/components/index.ts`)
- [ ] **Step 5:** Verify TypeScript again
- [ ] **Step 6:** Commit both files

**Commit messages:**
```
feat: add HealthAlert component with status indicator
feat: export HealthAlert from components barrel
```

**Success criteria:**
- File created at correct path
- Component is named HealthAlert and is default export
- Status icon button with indicator badge
- Popover shows list of health alerts
- Alert count badge displays when critical or warning alerts exist
- Each alert shows icon (colored by type), title, message, and date
- "All systems operational" message when no alerts
- Status color changes based on alert severity (red for critical, yellow for warning, green for healthy)
- Exported in barrel index
- TypeScript compiles with no errors
