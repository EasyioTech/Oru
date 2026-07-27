import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users as UsersIcon, Loader2 } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";

export default function Users() {
  const { users, isLoading, error } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-destructive">
        Error loading users.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role?.replace('_', ' ') || 'User'}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status || 'Active'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
