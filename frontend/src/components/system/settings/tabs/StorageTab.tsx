import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SystemSettings } from '@/services/api/system';

interface StorageTabProps {
  formData: Partial<SystemSettings>;
  onChange: (field: keyof SystemSettings, value: unknown) => void;
}

export function StorageTab({ formData, onChange }: StorageTabProps) {
  const isS3Like = formData.file_storage_provider === 'aws_s3' || formData.file_storage_provider === 'r2' || formData.file_storage_provider === 'minio';
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Storage Provider</h3>
        <div className="space-y-2">
          <Label htmlFor="file_storage_provider">Provider</Label>
          <Select value={formData.file_storage_provider || 'local'} onValueChange={v => onChange('file_storage_provider', v)}>
            <SelectTrigger><SelectValue placeholder="Select storage provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local Filesystem</SelectItem>
              <SelectItem value="aws_s3">AWS S3</SelectItem>
              <SelectItem value="r2">Cloudflare R2</SelectItem>
              <SelectItem value="minio">MinIO (S3 Compatible)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.file_storage_provider === 'local' && (
          <div className="space-y-2 border rounded-md p-4">
            <Label htmlFor="file_storage_path">Storage Path</Label>
            <Input id="file_storage_path" value={formData.file_storage_path || '/app/storage'} onChange={e => onChange('file_storage_path', e.target.value)} placeholder="/app/storage" />
            <p className="text-xs text-muted-foreground">Absolute path on the server filesystem.</p>
          </div>
        )}

        {isS3Like && (
          <div className="space-y-4 border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aws_s3_bucket">Bucket Name</Label>
                <Input id="aws_s3_bucket" value={formData.aws_s3_bucket || ''} onChange={e => onChange('aws_s3_bucket', e.target.value)} placeholder="my-bucket" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws_s3_region">Region</Label>
                <Input id="aws_s3_region" value={formData.aws_s3_region || 'auto'} onChange={e => onChange('aws_s3_region', e.target.value)} placeholder="us-east-1 or auto" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws_s3_access_key_id">Access Key ID</Label>
                <Input id="aws_s3_access_key_id" value={formData.aws_s3_access_key_id || ''} onChange={e => onChange('aws_s3_access_key_id', e.target.value)} placeholder={formData.aws_s3_access_key_id === '***' ? '••••••••' : 'Enter Access Key'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws_s3_secret_access_key">Secret Access Key</Label>
                <Input id="aws_s3_secret_access_key" type="password" value={formData.aws_s3_secret_access_key || ''} onChange={e => onChange('aws_s3_secret_access_key', e.target.value)} placeholder={formData.aws_s3_secret_access_key === '***' ? '••••••••' : 'Enter Secret Key'} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aws_s3_endpoint">Custom Endpoint URL</Label>
                <Input id="aws_s3_endpoint" value={formData.aws_s3_endpoint || ''} onChange={e => onChange('aws_s3_endpoint', e.target.value)} placeholder="https://<accountid>.r2.cloudflarestorage.com or http://minio:9000" />
                <p className="text-xs text-muted-foreground">Required for R2 and MinIO. Leave empty for standard AWS S3.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aws_s3_public_url">Public Access URL (Optional)</Label>
                <Input id="aws_s3_public_url" value={formData.aws_s3_public_url || ''} onChange={e => onChange('aws_s3_public_url', e.target.value)} placeholder="https://cdn.example.com or https://pub-xxx.r2.dev" />
                <p className="text-xs text-muted-foreground">Used to construct file URLs. If empty, standard S3/R2 URLs are used.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="allowed_file_types">Allowed file types</Label>
        <Input id="allowed_file_types" value={formData.allowed_file_types || 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip'} onChange={e => onChange('allowed_file_types', e.target.value)} placeholder="jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip" />
        <p className="text-sm text-muted-foreground">Extensions separated by comma</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="max_file_size_mb">Max Upload Size (MB)</Label>
        <Input id="max_file_size_mb" type="number" value={formData.max_file_size_mb ?? 10} onChange={e => onChange('max_file_size_mb', parseInt(e.target.value, 10) || 10)} min={1} max={100} />
        <p className="text-sm text-muted-foreground">Server validation limit</p>
      </div>
    </div>
  );
}
