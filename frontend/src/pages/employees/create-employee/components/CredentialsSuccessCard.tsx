/**
 * Credentials success card - shown after employee creation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Copy, Download, Check } from "lucide-react";

interface CredentialsSuccessCardProps {
  credentialsText: string;
  copiedCreds: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onDismiss: () => void;
  personalEmail?: string;
}

export function CredentialsSuccessCard({
  credentialsText,
  copiedCreds,
  onCopy,
  onDownload,
  onDismiss,
  personalEmail,
}: CredentialsSuccessCardProps) {
  return (
    <Card className="border-green-500/50 bg-green-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Login details – send to employee</CardTitle>
        <CardDescription>
          Email delivery is not configured. Copy or download the details below and send them to the
          employee&apos;s personal email{personalEmail ? ` (${personalEmail})` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="text-sm bg-muted/50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-sans">
          {credentialsText}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copiedCreds ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copiedCreds ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download .txt
          </Button>
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Add another employee
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/employee-management">Done</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
