/**
 * Document upload section for employee creation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Eye, X } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  file: File;
}

interface DocumentUploadSectionProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, category: string) => void;
  onRemoveFile: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
}

export function DocumentUploadSection({
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  formatFileSize,
}: DocumentUploadSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents Upload
        </CardTitle>
        <CardDescription>Upload employee documents and files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>ID Documents</Label>
            <Label htmlFor="id-docs" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload ID</p>
                </div>
              </div>
            </Label>
            <Input
              id="id-docs"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => onFileUpload(e, "id")}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label>Contracts</Label>
            <Label htmlFor="contracts" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload Contracts</p>
                </div>
              </div>
            </Label>
            <Input
              id="contracts"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={(e) => onFileUpload(e, "contract")}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label>Certifications</Label>
            <Label htmlFor="certifications" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload Certificates</p>
                </div>
              </div>
            </Label>
            <Input
              id="certifications"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => onFileUpload(e, "certification")}
              className="hidden"
            />
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-medium">Uploaded Files</Label>
            <div className="mt-2 space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {file.category}
                        </Badge>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => onRemoveFile(file.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
