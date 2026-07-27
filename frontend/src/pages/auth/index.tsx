import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeLogo } from '@/components/shared/ThemeLogo';
import { useBranding } from '@/contexts/BrandingContext';
import { Loader2, Lock, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const { systemName } = useBranding();
  const [searchParams] = useSearchParams();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-100" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-zinc-200 dark:bg-zinc-800/30 rounded-full blur-3xl opacity-10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl dark:shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div variants={itemVariants} className="flex justify-center">
              <ThemeLogo className="h-11 w-auto object-contain" />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Sign in to your {systemName} account
              </CardDescription>
            </motion.div>

            {searchParams.get('registered') === 'true' && (
              <motion.div
                variants={itemVariants}
                className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex gap-2"
              >
                <Cloud className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Account created! Check your email to verify, then sign in.</span>
              </motion.div>
            )}
          </CardHeader>

          <CardContent>
            <motion.div variants={itemVariants}>
              <LoginForm />
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <motion.div variants={itemVariants} className="text-sm text-center text-zinc-600 dark:text-zinc-400 w-full">
              Don't have an account?{' '}
              <Link
                to="/agency-signup"
                className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Create agency account
              </Link>
            </motion.div>

            {/* Trust signal */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-2"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Enterprise-grade security • 256-bit encryption</span>
            </motion.div>
          </CardFooter>
        </Card>

        {/* Footer message */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6"
        >
          By signing in, you agree to our{' '}
          <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 underline transition-colors">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300 underline transition-colors">
            Privacy Policy
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
