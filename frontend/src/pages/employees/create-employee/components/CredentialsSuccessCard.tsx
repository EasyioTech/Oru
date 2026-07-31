/**
 * Credentials success card - shown after employee creation
 */

import { FloatingCard } from "@/components/ui/design-tokens";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Copy, Download, Check, KeyRound } from "lucide-react";

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
    <FloatingCard className="p-8 mb-8 border-green-500/30 bg-green-50/50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-green-900">
          <KeyRound className="h-5 w-5" />
          <h2 className="text-xl font-bold">Login details – send to employee</h2>
        </div>
        <p className="text-green-800/80 text-sm">
          Email delivery is not configured. Copy or download the details below and send them to the
          employee&apos;s personal email{personalEmail ? ` (${personalEmail})` : ""}.
        </p>
      </div>
      
      <div className="space-y-6">
        <pre className="text-sm bg-white/70 p-5 rounded-2xl border border-green-100 shadow-inner overflow-x-auto whitespace-pre-wrap font-sans text-gray-800">
          {credentialsText}
        </pre>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-green-200 hover:bg-green-100 hover:text-green-900 shadow-sm" onClick={onCopy}>
            {copiedCreds ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copiedCreds ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" className="rounded-xl border-green-200 hover:bg-green-100 hover:text-green-900 shadow-sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download .txt
          </Button>
          <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={onDismiss}>
            Add another employee
          </Button>
          <Button asChild variant="ghost" className="rounded-xl hover:bg-green-100 hover:text-green-900">
            <Link to="/employees">Done</Link>
          </Button>
        </div>
      </div>
    </FloatingCard>
  );
}
