import { User, Upload, X } from "lucide-react";
import { FloatingCard } from "@/components/ui/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfilePhotoCardProps {
  profileImage: File | null;
  profileImagePreview: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function ProfilePhotoCard({ profileImage, profileImagePreview, onUpload, onRemove }: ProfilePhotoCardProps) {
  return (
    <FloatingCard className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-gray-900">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-bold">Profile Photo</h2>
        </div>
        <p className="text-gray-500 text-sm">Upload employee profile picture</p>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
          {profileImagePreview
            ? <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
            : <User className="h-8 w-8 text-gray-300" />}
        </div>
        <div className="flex flex-col space-y-3">
          <Label htmlFor="profile-image" className="cursor-pointer">
            <div className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Upload Photo</span>
            </div>
          </Label>
          <Input id="profile-image" type="file" accept="image/*" onChange={onUpload} className="hidden" />
          {profileImage && (
            <Button type="button" variant="outline" size="sm" onClick={onRemove} className="rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
              <X className="h-3 w-3 mr-1" />Remove
            </Button>
          )}
        </div>
      </div>
    </FloatingCard>
  );
}
