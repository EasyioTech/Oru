import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function TeamAssignmentPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4">
            Team assignments are currently managed directly within the employee profiles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}