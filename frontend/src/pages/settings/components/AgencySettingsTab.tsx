/**
 * Agency Settings Tab Component
 * Note: This is a large component with multiple sections
 * For full implementation, see Settings.original.tsx lines 966-1299
 */

import { FloatingCard, PillButton } from "@/components/ui/design-tokens";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building, Palette, Globe, Clock, DollarSign, Loader2 } from "lucide-react";
import { useAgencySettingsExtended } from '../hooks/useAgencySettingsExtended';
import { useCurrency } from "@/hooks/useCurrency";
import { LogoUpload } from './LogoUpload';
import { COLOR_PRESETS, TIMEZONES, DATE_FORMATS, FISCAL_YEAR_OPTIONS, WEEKDAYS } from '../utils/settingsConstants';

export const AgencySettingsTab = () => {
  const { availableCurrencies } = useCurrency();
  const {
    agencySettings,
    setAgencySettings,
    loading,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    saveAgencySettings,
  } = useAgencySettingsExtended();

  const applyColorPreset = (preset: { primary: string; secondary: string }) => {
    setAgencySettings(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setAgencySettings(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const handleLogoChange = (file: File | null, preview: string) => {
    setLogoFile(file);
    setLogoPreview(preview);
  };

  const removeLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview('');
    setAgencySettings(prev => ({ ...prev, logo_url: '' }));
  };

  const inputStyle = "bg-white/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11";
  const selectTriggerStyle = "bg-white/60 border-transparent rounded-xl focus:ring-gray-200 shadow-sm transition-all h-11";

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Basic Agency Info */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Building className="h-5 w-5" />
            <h2 className="text-xl font-bold">Agency Information</h2>
          </div>
          <p className="text-gray-500 text-sm">Configure your agency's basic information and branding</p>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName" className="text-gray-600 font-medium ml-1">Agency Name</Label>
              <Input
                id="agencyName"
                value={agencySettings.agency_name}
                onChange={(e) => setAgencySettings(prev => ({ ...prev, agency_name: e.target.value }))}
                placeholder="Enter your agency name"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agencyDomain" className="text-gray-600 font-medium ml-1">Email Domain</Label>
              <Input
                id="agencyDomain"
                value={agencySettings.domain}
                onChange={(e) => setAgencySettings(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="company.com (without @)"
                className={inputStyle}
              />
              <p className="text-xs text-gray-400 ml-1">
                Used for auto-generating employee email addresses
              </p>
            </div>
          </div>

          <LogoUpload
            logoPreview={logoPreview}
            onLogoChange={handleLogoChange}
            onRemove={removeLogoPreview}
          />
        </div>
      </FloatingCard>

      {/* Branding & Theme */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-bold">Branding & Theme</h2>
          </div>
          <p className="text-gray-500 text-sm">Customize your agency's color scheme</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-gray-600 font-medium ml-1">Quick Color Presets</Label>
            <div className="flex flex-wrap gap-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 shadow-sm rounded-xl hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-gray-600 font-medium ml-1">Primary Color</Label>
              <div className="flex gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={agencySettings.primary_color}
                  onChange={(e) => setAgencySettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-11 p-1 cursor-pointer bg-white border-transparent rounded-xl shadow-sm focus-visible:ring-gray-200"
                />
                <Input
                  value={agencySettings.primary_color}
                  onChange={(e) => setAgencySettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#0a6ed1"
                  className={`flex-1 ${inputStyle}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor" className="text-gray-600 font-medium ml-1">Secondary Color</Label>
              <div className="flex gap-3">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={agencySettings.secondary_color}
                  onChange={(e) => setAgencySettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-16 h-11 p-1 cursor-pointer bg-white border-transparent rounded-xl shadow-sm focus-visible:ring-gray-200"
                />
                <Input
                  value={agencySettings.secondary_color}
                  onChange={(e) => setAgencySettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#0854a0"
                  className={`flex-1 ${inputStyle}`}
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Preview</p>
            <div className="flex gap-3">
              <button
                className="px-5 py-2.5 rounded-xl font-medium text-white shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: agencySettings.primary_color }}
              >
                Primary Button
              </button>
              <button
                className="px-5 py-2.5 rounded-xl font-medium text-white shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: agencySettings.secondary_color }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* Regional & Financial Settings */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Globe className="h-5 w-5" />
            <h2 className="text-xl font-bold">Regional & Financial Settings</h2>
          </div>
          <p className="text-gray-500 text-sm">Configure timezone, currency, and fiscal settings</p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency" className="text-gray-600 font-medium ml-1">Default Currency</Label>
              <Select
                value={agencySettings.default_currency}
                onValueChange={(value) => setAgencySettings(prev => ({ ...prev, default_currency: value }))}
              >
                <SelectTrigger className={selectTriggerStyle}>
                  <SelectValue placeholder="Select currency">
                    {availableCurrencies[agencySettings.default_currency] ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {availableCurrencies[agencySettings.default_currency].symbol} {availableCurrencies[agencySettings.default_currency].code}
                        </span>
                      </div>
                    ) : (
                      <span>Select currency</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {Object.entries(availableCurrencies)
                    .filter(([key]) => key !== 'default')
                    .map(([countryCode, currency]) => (
                      <SelectItem key={countryCode} value={countryCode} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{currency.symbol}</span>
                          <span>{currency.code}</span>
                          <span className="text-gray-400">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-gray-600 font-medium ml-1">Timezone</Label>
              <Select
                value={agencySettings.timezone}
                onValueChange={(value) => setAgencySettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className={selectTriggerStyle}>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value} className="rounded-lg">
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="text-gray-600 font-medium ml-1">Date Format</Label>
              <Select
                value={agencySettings.date_format}
                onValueChange={(value) => setAgencySettings(prev => ({ ...prev, date_format: value }))}
              >
                <SelectTrigger className={selectTriggerStyle}>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {DATE_FORMATS.map(fmt => (
                    <SelectItem key={fmt.value} value={fmt.value} className="rounded-lg">
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart" className="text-gray-600 font-medium ml-1">Fiscal Year Start</Label>
              <Select
                value={agencySettings.fiscal_year_start}
                onValueChange={(value) => setAgencySettings(prev => ({ ...prev, fiscal_year_start: value }))}
              >
                <SelectTrigger className={selectTriggerStyle}>
                  <SelectValue placeholder="Select fiscal year start" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {FISCAL_YEAR_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* Working Hours & Days */}
      <FloatingCard className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Working Hours & Days</h2>
          </div>
          <p className="text-gray-500 text-sm">Configure default working schedule for the organization</p>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workingHoursStart" className="text-gray-600 font-medium ml-1">Working Hours Start</Label>
              <Input
                id="workingHoursStart"
                type="time"
                value={agencySettings.working_hours_start}
                onChange={(e) => setAgencySettings(prev => ({ ...prev, working_hours_start: e.target.value }))}
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHoursEnd" className="text-gray-600 font-medium ml-1">Working Hours End</Label>
              <Input
                id="workingHoursEnd"
                type="time"
                value={agencySettings.working_hours_end}
                onChange={(e) => setAgencySettings(prev => ({ ...prev, working_hours_end: e.target.value }))}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-600 font-medium ml-1">Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => (
                <button
                  key={day.value}
                  onClick={() => toggleWorkingDay(day.value)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
                    agencySettings.working_days.includes(day.value)
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <PillButton 
              onClick={saveAgencySettings} 
              className={loading ? "opacity-70 cursor-not-allowed" : ""}
              label={
                loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Agency Settings
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

