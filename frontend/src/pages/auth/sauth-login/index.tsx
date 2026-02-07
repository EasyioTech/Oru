/**
 * Secret system-admin login page.
 * Path configurable via VITE_SAUTH_PATH (default /sauth).
 * No links to this page from auth, landing, or footer. Generic labels only.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function SauthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInSauth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signInSauth(email.trim(), password);
      if (err) {
        setError('Invalid credentials.');
        return;
      }
      navigate('/super-admin', { replace: true });
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">System</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sauth-email">Email</Label>
            <Input
              id="sauth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sauth-password">Password</Label>
            <Input
              id="sauth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white dark:bg-zinc-900"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
