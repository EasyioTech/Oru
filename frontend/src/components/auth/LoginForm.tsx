import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { loginUser } from '@/services/api/auth';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, Mail, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState('');
  const [twoFactorAgencyDatabase, setTwoFactorAgencyDatabase] = useState('');

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('remembered_email') || '',
      rememberMe: !!localStorage.getItem('remembered_email'),
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');

    if (data.rememberMe) {
      localStorage.setItem('remembered_email', data.email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    try {
      const loginResult = await loginUser({
        email: data.email,
        password: data.password,
      });

      if ((loginResult as any).requiresTwoFactor) {
        setTwoFactorUserId((loginResult as any).userId);
        setTwoFactorAgencyDatabase((loginResult as any).agencyDatabase);
        setRequiresTwoFactor(true);
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await signIn(data.email, data.password);
      if (signInError) setError('Invalid email or password.');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    }
    setIsLoading(false);
  };

  const handleTwoFactorVerified = async (token?: string, recoveryCode?: string) => {
    const data = watch();
    try {
      setIsLoading(true);
      const loginResult = await loginUser({
        email: data.email,
        password: data.password,
        twoFactorToken: token,
        recoveryCode,
      } as any);

      if (!(loginResult as any).requiresTwoFactor && loginResult.token) {
        localStorage.setItem('auth_token', loginResult.token);
        if ((loginResult.user as any).agency?.databaseName) {
          localStorage.setItem('agency_database', (loginResult.user as any).agency.databaseName);
          localStorage.setItem('agency_id', (loginResult.user as any).agency.id);
        }
        window.location.href = '/dashboard';
      } else {
        setError('Login failed after 2FA verification');
        setRequiresTwoFactor(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed after 2FA verification');
      setRequiresTwoFactor(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (requiresTwoFactor) {
    return (
      <TwoFactorVerification
        userId={twoFactorUserId}
        agencyDatabase={twoFactorAgencyDatabase}
        onVerified={handleTwoFactorVerified}
        onCancel={() => {
          setRequiresTwoFactor(false);
          setTwoFactorUserId('');
          setTwoFactorAgencyDatabase('');
        }}
      />
    );
  }

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg p-3.5 flex gap-2.5 text-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>

      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email address
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="pl-10 h-10 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-300/20 transition-all"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </Label>
          <Link to="/forgot-password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative group">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="pl-10 pr-10 h-10 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-300/20 transition-all"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="flex items-center gap-2.5">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="rememberMe" className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer font-normal">
          Remember this device
        </Label>
      </motion.div>

      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
        <Button
          type="submit"
          className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium transition-all active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </motion.div>
    </form>
  );
};
