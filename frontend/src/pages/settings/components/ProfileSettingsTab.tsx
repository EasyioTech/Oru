/**
 * Profile Settings Tab Component
 */

import { FloatingCard, PillButton } from "@/components/ui/design-tokens";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, User, X, Loader2 } from "lucide-react";
import { useProfileSettings } from '../hooks/useProfileSettings';
import { useAuth } from '@/hooks/useAuth';
import { validateFileSize } from '../utils/settingsValidation';
import { useToast } from '@/hooks/use-toast';
import { useUIPreferences } from '@/hooks/useUIPreferences';
import { Switch } from '@/components/ui/switch';
import { Button } from "@/components/ui/button";

export const ProfileSettingsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showSupportTicketButton, setSupportTicketVisibility } = useUIPreferences();
  const {
    profileSettings,
    setProfileSettings,
    loading,
    avatarFile,
    setAvatarFile,
    avatarPreview,
    setAvatarPreview,
    saveProfileSettings,
  } = useProfileSettings();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFileSize(file, 2);
      if (!validation.valid) {
        toast({
          title: "Error",
          description: validation.error || "Avatar file size must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setProfileSettings(prev => ({ ...prev, avatar_url: '' }));
  };

  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>
          <p className="text-gray-500 text-sm">Update your personal information and avatar</p>
        </div>

        <div className="space-y-8">
          {/* Avatar */}
          <div className="space-y-4">
            <Label className="text-gray-600 font-medium ml-1">Profile Photo</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                    <User className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                {avatarPreview && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full shadow-sm hover:scale-105 transition-transform"
                    onClick={removeAvatarPreview}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 max-w-sm">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className={`cursor-pointer ${inputStyle}`}
                />
                <p className="text-xs text-gray-400 mt-2 ml-1">
                  Recommended: Square image, at least 200x200px (Max 2MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-600 font-medium ml-1">Full Name</Label>
              <Input
                id="fullName"
                value={profileSettings.full_name}
                onChange={(e) => setProfileSettings(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-600 font-medium ml-1">Phone Number</Label>
              <Input
                id="phone"
                value={profileSettings.phone}
                onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className={inputStyle}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-600 font-medium ml-1">Department</Label>
              <Input
                id="department"
                value={profileSettings.department}
                onChange={(e) => setProfileSettings(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Engineering"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-600 font-medium ml-1">Position / Job Title</Label>
              <Input
                id="position"
                value={profileSettings.position}
                onChange={(e) => setProfileSettings(prev => ({ ...prev, position: e.target.value }))}
                placeholder="e.g., Senior Developer"
                className={inputStyle}
              />
            </div>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <h2 className="text-xl font-bold">Contact Details</h2>
          </div>
          <p className="text-gray-500 text-sm">Manage your email addresses</p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-600 font-medium ml-1">Work Email Address</Label>
            <Input
              value={user?.email || ''}
              disabled
              className="bg-gray-50 border-transparent rounded-xl h-11 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 ml-1">
              Contact your administrator to change your work email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalEmail" className="text-gray-600 font-medium ml-1">Personal Email</Label>
            <Input
              id="personalEmail"
              type="email"
              value={profileSettings.personal_email}
              onChange={(e) => setProfileSettings(prev => ({ ...prev, personal_email: e.target.value }))}
              placeholder="personal@example.com"
              className={inputStyle}
            />
            <p className="text-xs text-gray-400 ml-1">
              Optional. Used for login credentials and personal contact
            </p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <h2 className="text-xl font-bold">Preferences</h2>
          </div>
          <p className="text-gray-500 text-sm">Application-wide UI preferences</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 ml-1">UI Preferences</h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-gray-100/50">
              <div className="space-y-1">
                <Label className="text-gray-700 font-medium">Show Support Ticket Button</Label>
                <p className="text-xs text-gray-500">
                  Display the floating help button in the bottom right corner of the application.
                </p>
              </div>
              <Switch
                checked={showSupportTicketButton}
                onCheckedChange={setSupportTicketVisibility}
              />
            </div>
          </div>

          <div className="pt-2">
            <PillButton 
              onClick={saveProfileSettings} 
              className={loading ? "opacity-70 cursor-not-allowed" : ""}
              label={
                loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Profile
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

