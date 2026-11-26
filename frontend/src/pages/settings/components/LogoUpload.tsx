/**
 * Logo Upload Component
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImageWithAuth } from "@/components/ui/AvatarImageWithAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { compressImage } from "@/utils/imageCompression";
import { validateFileSize } from '../utils/settingsValidation';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  logoPreview: string;
  onLogoChange: (file: File | null, preview: string) => void;
  onRemove: () => void;
}

export const LogoUpload = ({ logoPreview, onLogoChange, onRemove }: LogoUploadProps) => {
  const { toast } = useToast();

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFileSize(file, 5);
      if (!validation.valid) {
        toast({
          title: "Error",
          description: validation.error || "Logo file size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        // Compress the image more aggressively to reduce size (max 600x600, 70% quality)
        const compressedDataUrl = await compressImage(file, 600, 600, 0.7);
        const sizeMB = (compressedDataUrl.length / (1024 * 1024)).toFixed(2);
        onLogoChange(file, compressedDataUrl);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to process logo image",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-600 font-medium ml-1">Agency Logo</Label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="cursor-pointer bg-white/60 dark:bg-slate-800/60 border-transparent rounded-xl focus-visible:ring-gray-200 shadow-sm transition-all h-11"
          />
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            Upload a logo (PNG, JPG, SVG - Max 5MB)
          </p>
        </div>
        {logoPreview && (
          <div className="relative">
            <Avatar className="w-16 h-16 rounded border bg-white flex items-center justify-center">
              <AvatarImageWithAuth
                src={logoPreview}
                alt="Logo preview"
                className="object-contain p-1"
              />
              <AvatarFallback className="text-xs">Logo</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

