import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, UserPlus, Clock, Edit } from 'lucide-react';
import type { CreatorInfo, UpdaterInfo } from '../hooks/useCreateClient';
import type { ClientFormData } from '../types';

interface Props {
  loading: boolean;
  isEditing: boolean;
  hasDraft: boolean;
  formData: ClientFormData;
  creatorInfo: CreatorInfo | null;
  updaterInfo: UpdaterInfo | null;
  profile: { full_name?: string } | null;
  user: { email?: string } | null;
  clearDraft: () => void;
}

export function ClientFormSidebar({ loading, isEditing, hasDraft, formData, creatorInfo, updaterInfo, profile, user, clearDraft }: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creating...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />{isEditing ? 'Update Client' : 'Create Client'}</>
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/clients')} disabled={loading}>
            Cancel
          </Button>
          {hasDraft && !isEditing && (
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={clearDraft}>
              Clear Draft
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Form Status</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Required Fields:</span>
            <span className={formData.name.trim() ? 'text-green-600' : 'text-destructive'}>
              {formData.name.trim() ? '✓ Complete' : '✗ Incomplete'}
            </span>
          </div>
          {hasDraft && !isEditing && (
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Draft Status:</span>
              <span className="text-blue-600">Saved</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Record Information
          </CardTitle>
          <CardDescription>Transparency and audit trail</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {creatorInfo ? (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserPlus className="h-3 w-3" />
                  <span className="text-xs font-medium">Created By</span>
                </div>
                <div className="pl-5">
                  <p className="font-medium">{creatorInfo.name}</p>
                  {creatorInfo.email && <p className="text-xs text-muted-foreground">{creatorInfo.email}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(creatorInfo.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {updaterInfo && (
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Edit className="h-3 w-3" />
                    <span className="text-xs font-medium">Last Updated</span>
                  </div>
                  <div className="pl-5">
                    {updaterInfo.name !== 'System' && <p className="font-medium text-xs">{updaterInfo.name}</p>}
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(updaterInfo.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : isEditing ? (
            <div className="text-center py-2 text-muted-foreground text-xs">Loading record information...</div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserPlus className="h-3 w-3" />
                <span className="text-xs font-medium">Will be created by</span>
              </div>
              <div className="pl-5">
                <p className="font-medium">{profile?.full_name || user?.email || 'Current User'}</p>
                {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
