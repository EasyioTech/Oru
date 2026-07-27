import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2 } from "lucide-react";
import { useEmployeeProjects } from "@/hooks/useEmployeeProjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EmployeeProjects() {
  const { projects, isLoading, error } = useEmployeeProjects();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (error) return <div className="p-6 text-destructive">Error loading projects.</div>;

  return (
    <div className="space-y-5">
      <PageHeader title="My Projects" description="Track your assigned projects" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList><TabsTrigger value="projects">Projects</TabsTrigger></TabsList>
        <TabsContent value="projects" className="space-y-4 pt-4">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No assigned projects found.</div>
          ) : (
            <div className="grid gap-4">
              {projects.map(p => (
                <Card key={p.id}>
                  <CardHeader className="pb-3 flex justify-between items-start">
                    <div>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription>{p.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{p.status?.replace('_', ' ')}</Badge>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="font-semibold">{p.progress || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
