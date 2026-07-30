import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { BookOpen, ArrowRight, Zap } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-modules' | 'no-team' | 'no-data';
  title: string;
  description: string;
  action: { label: string; url: string };
  icon?: React.ReactNode;
}

export function EmptyState({ type, title, description, action, icon }: EmptyStateProps) {
  const getBackground = () => {
    switch (type) {
      case 'no-modules':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'no-team':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200';
      case 'no-data':
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`border ${getBackground()}`}>
      <CardContent className="pt-12 pb-8">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <div className="mb-4 p-3 rounded-lg bg-white/50">
            {icon || <BookOpen className="h-8 w-8 text-gray-400" />}
          </div>
          <CardTitle className="mb-2">{title}</CardTitle>
          <CardDescription className="mb-6">{description}</CardDescription>
          <Button onClick={() => (window.location.href = action.url)} className="gap-2">
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface OnboardingGuideProps {
  stage: 'setup' | 'activation' | 'growth';
}

const STAGE_CONTENT = {
  setup: {
    title: '🚀 Setup Your Workspace',
    subtitle: 'Complete these steps to get started',
    steps: [
      'Invite your team members',
      'Add your first client or project',
      'Enable the modules you need',
      'Configure team roles and permissions',
    ],
    icon: Zap,
    tips: [
      'Pro tip: Start with CRM or Projects to manage your core business',
      'You can enable more modules anytime from settings',
    ],
  },
  activation: {
    title: '⚡ Activate Key Features',
    subtitle: 'Unlock more capabilities for your team',
    steps: [
      'Add more team members',
      'Set up automation and workflows',
      'Configure billing and payments',
      'Connect integrations',
    ],
    icon: Zap,
    tips: [
      'Automation saves your team hours every week',
      'Check the integrations marketplace for tools you use daily',
    ],
  },
  growth: {
    title: '📈 Scale Your Operations',
    subtitle: 'Advanced features for growing teams',
    steps: [
      'Set up advanced reporting',
      'Create team templates',
      'Enable advanced permissions',
      'Optimize workflows',
    ],
    icon: BookOpen,
    tips: [
      'Custom reports help you make data-driven decisions',
      'Templates speed up repetitive processes',
    ],
  },
};

export function OnboardingGuide({ stage }: OnboardingGuideProps) {
  const content = STAGE_CONTENT[stage];
  const Icon = content.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {content.title}
        </CardTitle>
        <CardDescription>{content.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-sm mb-3">Next Steps</h4>
          <div className="space-y-2">
            {content.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-2">Tips</h4>
          <ul className="space-y-2">
            {content.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
