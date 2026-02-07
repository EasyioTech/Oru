import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Upload, Image as ImageIcon } from 'lucide-react';
import { INDUSTRY_OPTIONS, BUSINESS_TYPES } from '../../constants';
import type { AgencySetupFormData } from '../../types';

interface CompanyProfileStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
  logoPreview: string | null;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CompanyProfileStep({ formData, setFormData, logoPreview, onLogoUpload }: CompanyProfileStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <Building2 className="h-5 w-5 text-primary" />
          Company Profile
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Tell us about your company. This information will be used throughout the platform.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Logo</Label>
          <div className="flex items-center gap-6">
            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No logo</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="logo-upload" />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">Recommended: 512x512px, PNG or JPG, max 5MB</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              className="h-11 md:h-11 text-base"
              autoComplete="organization"
              inputMode="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyTagline" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Company Tagline
            </Label>
            <Input
              id="companyTagline"
              placeholder="Your company's tagline or slogan"
              value={formData.companyTagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyTagline: e.target.value }))}
              className="h-11 md:h-11 text-base"
              autoComplete="off"
              inputMode="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Industry
            </Label>
            <Select value={formData.industry} onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}>
              <SelectTrigger className="h-11 md:h-11 text-base">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry} className="text-base">
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Business Type
            </Label>
            <Select value={formData.businessType} onValueChange={(value) => setFormData((prev) => ({ ...prev, businessType: value }))}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Year Founded
            </Label>
            <Input
              id="foundedYear"
              type="number"
              placeholder="e.g., 2020"
              value={formData.foundedYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, foundedYear: e.target.value }))}
              className="h-11 md:h-11 text-base"
              min={1900}
              max={new Date().getFullYear()}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCount">Number of Employees</Label>
            <Select value={formData.employeeCount} onValueChange={(value) => setFormData((prev) => ({ ...prev, employeeCount: value }))}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Company Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of your company..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="resize-none text-base"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
