import { User, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile Photo</CardTitle>
        <CardDescription>Upload employee profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {profileImagePreview
              ? <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
              : <User className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload Photo</span>
              </div>
            </Label>
            <Input id="profile-image" type="file" accept="image/*" onChange={onUpload} className="hidden" />
            {profileImage && (
              <Button type="button" variant="outline" size="sm" onClick={onRemove}>
                <X className="h-3 w-3 mr-1" />Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
