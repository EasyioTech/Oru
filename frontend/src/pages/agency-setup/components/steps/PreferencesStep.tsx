import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Globe2, Bell, Zap } from 'lucide-react';
import { TIMEZONES, DATE_FORMATS } from '../../constants';
import type { AgencySetupFormData } from '../../types';

interface PreferencesStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
}

export function PreferencesStep({ formData, setFormData }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <Settings className="h-5 w-5 text-primary" />
          System Preferences
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure your system preferences and notification settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Globe2 className="h-4 w-4 text-primary" />
              Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</Label>
                <Select value={formData.dateFormat} onValueChange={(value) => setFormData((prev) => ({ ...prev, dateFormat: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Format</Label>
                <Select value={formData.timeFormat} onValueChange={(value) => setFormData((prev) => ({ ...prev, timeFormat: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Week Starts On</Label>
                <Select value={formData.weekStart} onValueChange={(value) => setFormData((prev) => ({ ...prev, weekStart: value }))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch
                checked={formData.notifications.sms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, sms: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
              </div>
              <Switch
                checked={formData.notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, weeklyReport: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive monthly summary reports</p>
              </div>
              <Switch
                checked={formData.notifications.monthlyReport}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    notifications: { ...prev.notifications, monthlyReport: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Zap className="h-4 w-4 text-primary" />
              Feature Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payroll Management</Label>
                <p className="text-sm text-muted-foreground">Enable payroll features</p>
              </div>
              <Switch
                checked={formData.features.enablePayroll}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: { ...prev.features, enablePayroll: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Management</Label>
                <p className="text-sm text-muted-foreground">Enable project tracking</p>
              </div>
              <Switch
                checked={formData.features.enableProjects}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: { ...prev.features, enableProjects: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">CRM</Label>
                <p className="text-sm text-muted-foreground">Enable customer relationship management</p>
              </div>
              <Switch
                checked={formData.features.enableCRM}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: { ...prev.features, enableCRM: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inventory Management</Label>
                <p className="text-sm text-muted-foreground">Enable inventory tracking</p>
              </div>
              <Switch
                checked={formData.features.enableInventory}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: { ...prev.features, enableInventory: checked },
                  }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Advanced Reports</Label>
                <p className="text-sm text-muted-foreground">Enable advanced reporting features</p>
              </div>
              <Switch
                checked={formData.features.enableReports}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    features: { ...prev.features, enableReports: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
