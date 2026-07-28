import { useCallback } from 'react';
import { useCapabilities } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface ModuleToggleProps {
  workspaceId?: string;
  onModuleToggle?: (module: string, enabled: boolean) => Promise<void>;
}

const MODULE_DESCRIPTIONS: Record<string, { description: string; benefits: string[] }> = {
  crm: {
    description: 'Manage clients, leads, and business relationships',
    benefits: ['Client database', 'Lead tracking', 'Sales pipeline'],
  },
  hr: {
    description: 'Streamline HR, payroll, and employee management',
    benefits: ['Employee records', 'Attendance tracking', 'Payroll processing'],
  },
  finance: {
    description: 'Handle invoicing, payments, and financial reporting',
    benefits: ['Invoice generation', 'Payment tracking', 'Financial reports'],
  },
  projects: {
    description: 'Plan and execute projects with tasks and milestones',
    benefits: ['Project planning', 'Task management', 'Time tracking'],
  },
  inventory: {
    description: 'Track products, warehouses, and stock levels',
    benefits: ['Stock management', 'Warehouse tracking', 'BOM support'],
  },
  procurement: {
    description: 'Manage purchase orders and supplier relationships',
    benefits: ['PO management', 'Supplier database', 'Order tracking'],
  },
};

export function ModuleToggle({ workspaceId, onModuleToggle }: ModuleToggleProps) {
  const { data: capabilities, isLoading } = useCapabilities(workspaceId);

  const handleToggle = useCallback(
    async (moduleId: string, enabled: boolean) => {
      if (onModuleToggle) {
        await onModuleToggle(moduleId, !enabled);
      }
    },
    [onModuleToggle]
  );

  if (isLoading) return <div className="text-center text-gray-500">Loading modules...</div>;
  if (!capabilities) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enable Modules</CardTitle>
        <CardDescription>Choose which modules to activate in your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.modules.map((module) => {
            const info = MODULE_DESCRIPTIONS[module.module];
            if (!info) return null;

            return (
              <div
                key={module.module}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm capitalize">{module.module}</h4>
                    <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                    <div className="mt-2 space-y-1">
                      {info.benefits.map((benefit) => (
                        <div key={benefit} className="text-xs text-gray-500 flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={module.enabled ? 'default' : 'outline'}
                    onClick={() => handleToggle(module.module, module.enabled)}
                    disabled={!module.available}
                    className="whitespace-nowrap"
                  >
                    {module.enabled ? '✓ Enabled' : 'Enable'}
                  </Button>
                </div>
                {!module.available && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-700">Upgrade required</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
