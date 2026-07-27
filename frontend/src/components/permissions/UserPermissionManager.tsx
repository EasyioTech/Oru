import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';

export function UserPermissionManager() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/admin/users')).data.data || [],
  });

  const { data: permissions, isLoading: loadingPerms } = useQuery({
    queryKey: ['permissions', selectedUserId],
    queryFn: async () => (await api.get(`/admin/users/${selectedUserId}/permissions`)).data.data || [],
    enabled: !!selectedUserId,
  });

  const { mutateAsync: togglePermission } = useMutation({
    mutationFn: async ({ permId, granted }: { permId: string, granted: boolean }) => {
      await api.put(`/admin/users/${selectedUserId}/permissions/${permId}`, { granted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedUserId] });
      toast.success('Permission updated');
    },
  });

  const filteredUsers = useMemo(() => {
    return (users || []).filter((u: any) => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Permission Overrides</CardTitle>
        <CardDescription>Manage user-specific permission overrides.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold mb-3">Select User</h3>
            {loadingUsers ? <Loader2 className="animate-spin mx-auto" /> : filteredUsers.map((user: any) => (
              <div
                key={user.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${selectedUserId === user.id ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback>{user.name?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {selectedUserId ? (
              loadingPerms ? <Loader2 className="animate-spin mx-auto" /> : (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  {permissions?.map((perm: any) => (
                    <div key={perm.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{perm.name}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                      <Switch 
                        checked={perm.granted} 
                        onCheckedChange={(checked) => togglePermission({ permId: perm.id, granted: checked })} 
                      />
                    </div>
                  ))}
                  {permissions?.length === 0 && <p className="text-muted-foreground text-sm">No permissions found</p>}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Select a user</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
