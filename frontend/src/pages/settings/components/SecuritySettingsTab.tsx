/**
 * Security Settings Tab Component
 */

import { FloatingCard, PillButton } from "@/components/ui/design-tokens";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, KeyRound, Shield, CheckCircle, AlertCircle, Loader2, X, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useSecuritySettings } from '../hooks/useSecuritySettings';
import { useState } from 'react';

export const SecuritySettingsTab = () => {
  const {
    securitySettings,
    setSecuritySettings,
    loading,
    twoFactorEnabled,
    twoFactorVerifiedAt,
    loading2FA,
    disable2FAPassword,
    setDisable2FAPassword,
    showDisableDialog,
    setShowDisableDialog,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    fetch2FAStatus,
    saveSecuritySettings,
    handleDisable2FA,
  } = useSecuritySettings();

  const [show2FASetup, setShow2FASetup] = useState(false);

  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Change Password */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Change Password</h2>
          </div>
          <p className="text-gray-500 text-sm">Update your account password for security</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-gray-600 font-medium ml-1">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={securitySettings.current_password}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, current_password: e.target.value }))}
                placeholder="Enter your current password"
                className={inputStyle}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-600 font-medium ml-1">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={securitySettings.new_password}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, new_password: e.target.value }))}
                placeholder="Enter your new password"
                className={inputStyle}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 ml-1">
              At least 8 characters. Avoid sequences (e.g. 123, abc) and repeated characters (e.g. 1111).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-600 font-medium ml-1">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={securitySettings.confirm_password}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm your new password"
                className={inputStyle}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {securitySettings.new_password && securitySettings.confirm_password && (
              <div className="flex items-center gap-2 mt-2 ml-1">
                {securitySettings.new_password === securitySettings.confirm_password ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <PillButton 
              onClick={saveSecuritySettings} 
              className={loading ? "opacity-70 cursor-not-allowed" : ""}
              label={
                loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Changing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Change Password
                  </span>
                )
              } 
            />
          </div>
        </div>
      </FloatingCard>

      {/* Two-Factor Authentication */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
          </div>
          <p className="text-gray-500 text-sm">Add an extra layer of security to your account with 2FA</p>
        </div>
        
        <div className="space-y-6">
          {!show2FASetup ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white/40 border border-gray-100/50 shadow-sm gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Status:</p>
                    {twoFactorEnabled ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Enabled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled
                      ? 'Your account is protected with two-factor authentication.'
                      : 'Enable 2FA to add an extra layer of security to your account.'}
                  </p>
                  {twoFactorEnabled && twoFactorVerifiedAt && (
                    <p className="text-xs font-medium text-gray-400">
                      Last verified: {new Date(twoFactorVerifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {!twoFactorEnabled ? (
                    <PillButton
                      onClick={() => setShow2FASetup(true)}
                      label={
                        <span className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" /> Enable 2FA
                        </span>
                      }
                    />
                  ) : (
                    <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                      <AlertDialogTrigger asChild>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
                          <X className="h-4 w-4" />
                          Disable 2FA
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the extra security layer from your account. 
                            You'll need to enter your password to confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="disable2FAPassword">Enter your password</Label>
                            <Input
                              id="disable2FAPassword"
                              type="password"
                              value={disable2FAPassword}
                              onChange={(e) => setDisable2FAPassword(e.target.value)}
                              placeholder="Enter your password to confirm"
                              className={inputStyle}
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDisable2FAPassword('')} className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDisable2FA}
                            disabled={!disable2FAPassword || loading2FA}
                            className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
                          >
                            {loading2FA ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Disabling...
                              </>
                            ) : (
                              'Disable 2FA'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              <Alert className="bg-blue-50/50 text-blue-800 border-blue-100 rounded-2xl">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong className="font-semibold text-blue-900">How 2FA works:</strong> When enabled, you'll need to enter a 6-digit code 
                  from your authenticator app (like Google Authenticator or Authy) each time you sign in. 
                  You'll also receive recovery codes that you can use if you lose access to your device.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="space-y-4 p-6 rounded-2xl bg-white/40 border border-gray-100/50 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Set Up Two-Factor Authentication</h3>
                <button
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShow2FASetup(false);
                    fetch2FAStatus();
                  }}
                >
                  Cancel
                </button>
              </div>
              <TwoFactorSetup 
                onComplete={() => {
                  setShow2FASetup(false);
                  fetch2FAStatus();
                }}
              />
            </div>
          )}
        </div>
      </FloatingCard>
    </div>
  );
};

