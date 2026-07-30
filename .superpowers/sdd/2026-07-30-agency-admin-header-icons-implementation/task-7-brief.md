# Task 7: Create QuickCreateMenu Component

**Files:**
- Create: `frontend/src/modules/core/components/QuickCreateMenu.tsx`

**Interfaces:**
- Consumes: React Router (useNavigate), TanStack Query (useQueryClient), Popover (shadcn/ui), useToast hook, lucide-react icons
- Produces: React component `<QuickCreateMenu />` (no props)
  - Renders: Plus icon button + popover with 4 quick create actions
  - Actions: Create Project, Invite User, Create Invoice, Create Task
  - Each action shows icon, label, and description

**Complete Implementation:**

```typescript
import { useState } from 'react';
import { Plus, Briefcase, Users, FileText, CheckSquare } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface CreateAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

export function QuickCreateMenu() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const actions: CreateAction[] = [
    {
      id: 'project',
      label: 'Create Project',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Start a new project',
      action: () => {
        // Dispatch open project form modal (via context or URL param)
        // For now, show toast as placeholder
        toast({
          title: 'Create Project',
          description: 'Project creation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'user',
      label: 'Invite User',
      icon: <Users className="w-4 h-4" />,
      description: 'Add team member',
      action: () => {
        toast({
          title: 'Invite User',
          description: 'User invitation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'invoice',
      label: 'Create Invoice',
      icon: <FileText className="w-4 h-4" />,
      description: 'Generate new invoice',
      action: () => {
        toast({
          title: 'Create Invoice',
          description: 'Invoice creation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'task',
      label: 'Create Task',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Add new task',
      action: () => {
        toast({
          title: 'Create Task',
          description: 'Task creation form would open here',
        });
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
          aria-label="Quick Create"
        >
          <Plus className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">
              Quick Create
            </h3>
          </div>
          <div className="p-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="mt-0.5 text-gray-600">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/QuickCreateMenu.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add QuickCreateMenu component with 4 create actions
```

**Success criteria:**
- File created at correct path
- Component is named QuickCreateMenu and is default export
- Plus icon button with popover
- Four actions: Create Project, Invite User, Create Invoice, Create Task
- Each action has icon, label, and description
- Toast notifications on action click (placeholder for form integration)
- Popover closes after action
- TypeScript compiles with no errors
