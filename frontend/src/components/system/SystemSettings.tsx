import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RefreshCw, Settings } from 'lucide-react';
import { IdentityTab, BrandingTab } from './settings-tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSystemSettings } from './settings/useSystemSettings';
import { SeoTab } from './settings/tabs/SeoTab';
import { AnalyticsTab } from './settings/tabs/AnalyticsTab';
import { EmailTab } from './settings/tabs/EmailTab';
import { SecurityTab } from './settings/tabs/SecurityTab';
import { StorageTab } from './settings/tabs/StorageTab';
import { OtherTab } from './settings/tabs/OtherTab';

export function SystemSettings() {
  const ctx = useSystemSettings();
  const { loading, saving, formData, activeTab, showConfirm, pendingTab,
    setPendingTab, setShowConfirm, loadSettings, handleSave, handleChange,
    handleTabChange, handleDiscardChanges, handleConfirmSave } = ctx;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings for branding, SEO, analytics, and more
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadSettings} disabled={loading || saving}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Changes</>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <IdentityTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="branding" className="space-y-6">
              <BrandingTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="seo" className="space-y-4">
              <SeoTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="email" className="space-y-4">
              <EmailTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              <SecurityTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="storage" className="space-y-4">
              <StorageTab formData={formData} onChange={handleChange} />
            </TabsContent>
            <TabsContent value="other" className="space-y-4">
              <OtherTab formData={formData} onChange={handleChange} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the "{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}" tab. Would you like to save them before switching, or discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTab(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard
            </AlertDialogAction>
            <AlertDialogAction onClick={handleConfirmSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
