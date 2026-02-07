/**
 * Branding Image Upload - Upload or enter URL for logos, favicons, etc.
 * Supports PNG, JPG, SVG, ICO. Max 2MB for favicon, 5MB for logos.
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Upload, Link2 } from 'lucide-react';
import { compressImage } from '@/utils/imageCompression';
import { validateFileSize } from '@/pages/settings/utils/settingsValidation';
import { useToast } from '@/hooks/use-toast';
const ACCEPT = 'image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,.png,.jpg,.jpeg,.svg,.ico';
const FAVICON_MAX_MB = 2;
const LOGO_MAX_MB = 5;

async function fileToDataUrl(file: File): Promise<string> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  if (isSvg) {
    const text = await file.text();
    const base64 = btoa(unescape(encodeURIComponent(text)));
    return `data:image/svg+xml;base64,${base64}`;
  }
  const isIco = file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico');
  if (isIco) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read ICO file'));
      reader.readAsDataURL(file);
    });
  }
  return compressImage(file, 800, 800, 0.8);
}

interface BrandingImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  maxSizeMB?: number;
}

export function BrandingImageUpload({
  label,
  value,
  onChange,
  placeholder = 'Enter URL or upload',
  helpText,
  maxSizeMB = LOGO_MAX_MB,
}: BrandingImageUploadProps) {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileSize(file, maxSizeMB);
    if (!validation.valid) {
      toast({
        title: 'Error',
        description: validation.error || `File must be under ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpg|jpeg|svg|ico)$/i)) {
      toast({
        title: 'Error',
        description: 'Please upload PNG, JPG, SVG, or ICO only',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to process image',
        variant: 'destructive',
      });
    }
    e.target.value = '';
  };

  const handleRemove = () => onChange('');

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={value.startsWith('data:') ? 'Image uploaded (use Remove to clear)' : placeholder}
            className="flex-1"
          />
          <label className="flex items-center gap-2 px-4 py-2 border rounded-md bg-muted/50 hover:bg-muted cursor-pointer text-sm whitespace-nowrap">
            <Upload className="h-4 w-4" />
            Upload
            <input
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>
        {value && (
          <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden rounded bg-background border">
              {value.startsWith('data:') || value.startsWith('http') ? (
                <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <Link2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <span className="flex-1 truncate text-sm text-muted-foreground">
              {value.startsWith('data:') ? 'Uploaded image' : value}
            </span>
            <Button type="button" size="sm" variant="ghost" onClick={handleRemove} aria-label="Remove">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      <p className="text-xs text-muted-foreground">
        PNG, JPG, SVG, ICO — Max {maxSizeMB}MB. Enter URL or click Upload.
      </p>
    </div>
  );
}
