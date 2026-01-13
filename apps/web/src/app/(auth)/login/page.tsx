'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageProvider';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { t } = useLanguage();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success(t.auth.loginSuccess);
      router.push('/dashboard');
    } catch (error: unknown) {
      // Check for specific error messages from API
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('401')) {
        toast.error(t.auth.invalidCredentials);
      } else if (errorMessage.includes('not found')) {
        toast.error(t.auth.emailNotFound);
      } else {
        toast.error(t.auth.invalidCredentials);
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/40 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-card/90 z-10 animate-in zoom-in-95 duration-500">
      <CardHeader className="space-y-1 text-center pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight">{t.auth.loginTitle}</CardTitle>
        <CardDescription>
          {t.auth.loginSubtitle}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className={`h-11 bg-white/50 dark:bg-muted/30 transition-all focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-destructive' : 'border-border/50 hover:border-primary/50'}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive animate-pulse">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`h-11 bg-white/50 dark:bg-muted/30 pr-10 transition-all focus:ring-2 focus:ring-primary/20 ${errors.password ? 'border-destructive' : 'border-border/50 hover:border-primary/50'}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive animate-pulse">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.auth.loggingIn}
              </>
            ) : (
              <>
                {t.auth.signIn} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t.auth.or}</span>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            {t.auth.noAccount}{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
              {t.auth.signUp}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
