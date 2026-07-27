import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users2, Mail, Loader2, UserPlus, Eye } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

export default function MyTeam() {
  const { teamMembers, isLoading, error } = useTeam();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading team...</span>
      </div>
    );
  }

  if (error) return <div className="p-6 text-destructive">Error loading team.</div>;

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Team"
        description="Organisation overview"
        actions={
          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={() => navigate('/create-employee')}>
            <UserPlus className="h-3.5 w-3.5" /> Add Member
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg">
            <CardHeader className="pb-4 flex flex-row items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{member.fullName?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{member.fullName}</CardTitle>
                <Badge variant="outline" className="mt-1 text-xs">{member.role || 'Employee'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <Badge variant="secondary" className="text-xs">{member.department || 'No Dept'}</Badge>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
