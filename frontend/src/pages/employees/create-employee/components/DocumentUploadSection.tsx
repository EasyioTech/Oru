/**
 * Document upload section for employee creation
 */

import { FloatingCard } from "@/components/ui/design-tokens";
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
    <FloatingCard className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-bold">Documents Upload</h2>
        </div>
        <p className="text-gray-500 text-sm">Upload employee documents and files</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label className="text-gray-600 font-medium ml-1">ID Documents</Label>
            <Label htmlFor="id-docs" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 bg-white border border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Upload ID</p>
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
          <div className="space-y-3">
            <Label className="text-gray-600 font-medium ml-1">Contracts</Label>
            <Label htmlFor="contracts" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 bg-white border border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Upload Contracts</p>
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
          <div className="space-y-3">
            <Label className="text-gray-600 font-medium ml-1">Certifications</Label>
            <Label htmlFor="certifications" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 bg-white border border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Upload Certificates</p>
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
          <div className="mt-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <Label className="text-sm font-semibold text-gray-700 ml-1">Uploaded Files</Label>
            <div className="mt-3 space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 shadow-sm rounded-xl transition-all hover:shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600 border-transparent">
                          {file.category}
                        </Badge>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveFile(file.id)} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FloatingCard>
  );
}
