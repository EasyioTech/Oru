import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Phone, Mail, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AgencySetupFormData } from '../../types';

interface BusinessDetailsStepProps {
  formData: AgencySetupFormData;
  setFormData: React.Dispatch<React.SetStateAction<AgencySetupFormData>>;
}

export function BusinessDetailsStep({ formData, setFormData }: BusinessDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg md:text-xl font-semibold mb-1.5 flex items-center gap-2 text-slate-900 dark:text-white">
          <FileText className="h-5 w-5 text-primary" />
          Business Details
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Legal and contact information for your business
        </p>
      </div>

      <Tabs defaultValue="legal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="legal" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-4">
            Legal Info
          </TabsTrigger>
          <TabsTrigger value="address" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-4">
            Address
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs md:text-sm py-2 md:py-2.5 px-2 md:px-4">
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="legal" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="legalName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Legal Business Name
              </Label>
              <Input
                id="legalName"
                placeholder="As registered with authorities"
                value={formData.legalName}
                onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                className="h-11 md:h-11 text-base"
                autoComplete="organization"
                inputMode="text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="Business registration number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxIdType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tax ID Type
              </Label>
              <Select value={formData.taxIdType} onValueChange={(value) => setFormData((prev) => ({ ...prev, taxIdType: value }))}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EIN">EIN (US)</SelectItem>
                  <SelectItem value="VAT">VAT (EU)</SelectItem>
                  <SelectItem value="GST">GST (India/Canada)</SelectItem>
                  <SelectItem value="ABN">ABN (Australia)</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID Number</Label>
              <Input
                id="taxId"
                placeholder="Enter your tax ID"
                value={formData.taxId}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Street Address
              </Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                City
              </Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                State/Province
              </Label>
              <Input
                id="state"
                placeholder="State or Province"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                ZIP/Postal Code
              </Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={formData.address.zipCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Country
              </Label>
              <Input
                id="country"
                placeholder="Country"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-11 md:h-11 pl-10 text-base"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Business Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-11 md:h-11 pl-10 text-base"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Website
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  className="h-11 md:h-11 pl-10 text-base"
                  autoComplete="url"
                  inputMode="url"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/company/..."
                value={formData.socialMedia.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialMedia: { ...prev.socialMedia, linkedin: e.target.value },
                  }))
                }
                className="h-11"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
