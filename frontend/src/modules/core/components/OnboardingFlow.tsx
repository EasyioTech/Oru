import { useState } from 'react';
import { useDashboardContext } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  url: string;
  completed: boolean;
}

interface OnboardingFlowProps {
  workspaceId?: string;
}

export function OnboardingFlow({ workspaceId }: OnboardingFlowProps) {
  const { data: context } = useDashboardContext(workspaceId);
  const [currentStep, setCurrentStep] = useState(0);

  if (!context?.needs_setup) return null;

  const steps: OnboardingStep[] = [
    {
      id: 'invite-team',
      title: 'Invite Your Team',
      description: 'Add team members to collaborate on projects and tasks.',
      action: 'Invite Team',
      url: '/settings/team',
      completed: (context?.greeting?.main === 'Good morning') || false,
    },
    {
      id: 'add-first-client',
      title: 'Add Your First Client',
      description: 'Set up your first client to start managing projects and invoices.',
      action: 'Add Client',
      url: '/crm/clients/new',
      completed: false,
    },
    {
      id: 'configure-modules',
      title: 'Enable Key Modules',
      description: 'Enable modules like HR, Finance, and Inventory based on your needs.',
      action: 'Configure',
      url: '/settings/modules',
      completed: false,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Let's Get Started</span>
          <span className="text-sm font-normal text-gray-600">
            {completedCount} of {steps.length} complete
          </span>
        </CardTitle>
        <CardDescription>Complete these steps to activate your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                i === currentStep ? 'bg-white border border-blue-300' : 'bg-white/50'
              }`}
              onClick={() => setCurrentStep(i)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {!step.completed && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={() => (window.location.href = steps[currentStep].url)}
            className="w-full"
          >
            {steps[currentStep].action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
