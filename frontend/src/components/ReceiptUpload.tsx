import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function ReceiptUpload({ onUploadComplete }: any) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { mutateAsync: uploadFile, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', file as File);
      return api.post('/finance/receipts/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('File uploaded');
      onUploadComplete?.();
      setFile(null);
    },
    onError: () => toast.error('Failed to upload file')
  });

  return (
    <div className="flex items-center space-x-2">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <Button onClick={() => uploadFile()} disabled={!file || isPending}>
        <Upload className="h-4 w-4 mr-2" /> {isPending ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
}
