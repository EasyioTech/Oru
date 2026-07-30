
import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getApiEndpoint } from '@/config/services';

const SystemEmail = () => {
    const { isSystemSuperAdmin, userRole } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!isSystemSuperAdmin && userRole !== 'super_admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(getApiEndpoint('/system/email/test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ to: email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error?.message || 'Failed to send email');
            }

            setResult(data);
            toast({
                title: "Success",
                description: "Test email sent successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Email Service</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure and test the main system SMTP service.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Configuration Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                SMTP Configuration
                            </CardTitle>
                            <CardDescription>
                                Current system email settings (Read-only)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertTitle>Environment Configured</AlertTitle>
                                <AlertDescription>
                                    Email settings are managed via environment variables (SMTP_HOST, SMTP_USER, etc.) for security.
                                </AlertDescription>
                            </Alert>

                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Service Provider</span>
                                    <span className="font-mono">Nodemailer (SMTP)</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Configuration Source</span>
                                    <span className="font-mono">.env</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="flex items-center text-green-600 gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Sender */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                Test Delivery
                            </CardTitle>
                            <CardDescription>
                                Send a test email to verify SMTP connectivity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendTest} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Recipient Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Test Email
                                        </>
                                    )}
                                </Button>
                            </form>

                            {result && (
                                <div className="mt-4 p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-40">
                                    <p className="font-bold mb-1 text-green-600">Sent Successfully!</p>
                                    <pre>{JSON.stringify(result, null, 2)}</pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default SystemEmail;
