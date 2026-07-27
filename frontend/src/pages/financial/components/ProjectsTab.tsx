import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrencySymbol } from '../utils/financialFormatters';

interface Props {
  projects: unknown[];
}

export function ProjectsTab({ projects }: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Financials</h3>
        <Button variant="outline" onClick={() => navigate('/project-management')}>
          <ExternalLink className="h-4 w-4 mr-2" />View All Projects
        </Button>
      </div>
      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No projects found</p>
            <p>Projects will appear here once they are created.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(projects as Record<string, unknown>[]).map(project => (
            <Card key={project.id as string} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.name as string}</CardTitle>
                    <p className="text-sm text-muted-foreground">{(project.project_code as string) || 'No code'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/project-management/${project.id}`)}>
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold">{formatCurrencySymbol((project.budget as number) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Cost</p>
                    <p className="font-semibold">{formatCurrencySymbol((project.actual_cost as number) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-green-600">{formatCurrencySymbol(((project.financials as Record<string, number>)?.totalPaid) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">{project.status as string}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
