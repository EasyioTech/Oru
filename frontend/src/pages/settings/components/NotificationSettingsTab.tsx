/**
 * Notification Settings Tab Component
 */

import { useState, useEffect } from 'react';
import { FloatingCard, PillButton } from "@/components/ui/design-tokens";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Bell, Mail, Loader2, Sparkles } from "lucide-react";
import { useNotificationSettings, NotificationSettings } from '../hooks/useNotificationSettings';

export const NotificationSettingsTab = () => {
  const {
    notificationSettings,
    loading,
    saveNotificationSettings,
  } = useNotificationSettings();

  const [localSettings, setLocalSettings] = useState<NotificationSettings>(notificationSettings);

  useEffect(() => {
    setLocalSettings(notificationSettings);
  }, [notificationSettings]);

  const handleSave = () => {
    saveNotificationSettings(localSettings);
  };

  const switchContainerStyle = "flex items-center justify-between p-5 rounded-2xl bg-white/40 border border-gray-100/50 hover:bg-white/60 transition-colors shadow-sm";

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-bold">Notification Preferences</h2>
          </div>
          <p className="text-gray-500 text-sm">Configure how and when you receive notifications</p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 ml-1">
            <Mail className="h-4 w-4 text-gray-500" />
            Delivery Methods
          </h3>
          
          <div className="space-y-3">
            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="emailNotifications" className="font-medium text-gray-700">Email Notifications</Label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={localSettings.email_notifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, email_notifications: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="pushNotifications" className="font-medium text-gray-700">Push Notifications</Label>
                <p className="text-xs text-gray-500">Receive browser push notifications</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={localSettings.push_notifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, push_notifications: checked }))}
              />
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-bold">Notification Categories</h2>
          </div>
          <p className="text-gray-500 text-sm">Choose which events trigger notifications</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="taskReminders" className="font-medium text-gray-700">Task Reminders</Label>
                <p className="text-xs text-gray-500">Upcoming & overdue tasks</p>
              </div>
              <Switch
                id="taskReminders"
                checked={localSettings.task_reminders}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, task_reminders: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="leaveNotifications" className="font-medium text-gray-700">Leave Updates</Label>
                <p className="text-xs text-gray-500">Leave requests and approvals</p>
              </div>
              <Switch
                id="leaveNotifications"
                checked={localSettings.leave_notifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, leave_notifications: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="payrollNotifications" className="font-medium text-gray-700">Payroll Updates</Label>
                <p className="text-xs text-gray-500">Salary & reimbursement updates</p>
              </div>
              <Switch
                id="payrollNotifications"
                checked={localSettings.payroll_notifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, payroll_notifications: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="projectUpdates" className="font-medium text-gray-700">Project Updates</Label>
                <p className="text-xs text-gray-500">Status changes and milestones</p>
              </div>
              <Switch
                id="projectUpdates"
                checked={localSettings.project_updates}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, project_updates: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="systemAlerts" className="font-medium text-gray-700">System Alerts</Label>
                <p className="text-xs text-gray-500">Important system announcements</p>
              </div>
              <Switch
                id="systemAlerts"
                checked={localSettings.system_alerts}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, system_alerts: checked }))}
              />
            </div>

            <div className={switchContainerStyle}>
              <div className="space-y-1">
                <Label htmlFor="marketingEmails" className="font-medium text-gray-700">Marketing & Promo</Label>
                <p className="text-xs text-gray-500">News and promotional content</p>
              </div>
              <Switch
                id="marketingEmails"
                checked={localSettings.marketing_emails}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, marketing_emails: checked }))}
              />
            </div>
          </div>

          <div className="pt-4">
            <PillButton 
              onClick={handleSave} 
              className={loading ? "opacity-70 cursor-not-allowed" : ""}
              label={
                loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Notification Preferences
                  </span>
                )
              } 
            />
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

