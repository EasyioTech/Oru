import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Loader2, UserCheck } from 'lucide-react';
import { useAdminUsers, AdminUser } from '@/hooks/useAdminUsers';
import { useViewAsUser } from '@/contexts/ViewAsUserContext';
import { useNavigate } from 'react-router-dom';

export default function ViewAsUser() {
  const { users, isLoading, error } = useAdminUsers();
  const { setViewingAs } = useViewAsUser();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const handleViewAs = () => {
    if (!selectedUser) return;
    setViewingAs({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role as any,
    });
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (error) return <div className="p-6 text-destructive">Error loading users</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">View As User</h1>
      <p className="text-muted-foreground">Select a user to view their dashboard</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto">
          {users.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer hover:shadow-md ${selectedUser?.id === user.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">{user.role?.replace('_', ' ')}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          {selectedUser ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedUser.name}</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleViewAs} className="w-full" disabled={selectedUser.status !== 'active'}>
                  <Eye className="h-4 w-4 mr-2" /> View As {selectedUser.name.split(' ')[0]}
                </Button>
                {selectedUser.status !== 'active' && (
                  <p className="text-sm text-muted-foreground text-center">Cannot view as inactive users</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Select a user to continue</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
