'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageProvider';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const { t } = useLanguage();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success(t.auth.registerSuccess);
      router.push('/login');
    } catch (error: unknown) {
      // Check for specific error messages from API
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('exists') || errorMessage.includes('409')) {
        toast.error(t.auth.emailExists);
      } else {
        toast.error(t.common.error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/40 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-card/90 z-10 animate-in zoom-in-95 duration-500">
      <CardHeader className="space-y-1 text-center pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight">{t.auth.registerTitle}</CardTitle>
        <CardDescription>
          {t.auth.registerSubtitle}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.auth.fullName}</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className={`h-11 bg-white/50 dark:bg-muted/30 transition-all focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-destructive' : 'border-border/50 hover:border-primary/50'}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive animate-pulse">{errors.name.message}</p>
            )}
          </div>

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
            <Label htmlFor="password">{t.auth.password}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`h-11 bg-white/50 dark:bg-muted/30 transition-all focus:ring-2 focus:ring-primary/20 ${errors.confirmPassword ? 'border-destructive' : 'border-border/50 hover:border-primary/50'}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive animate-pulse">{errors.confirmPassword.message}</p>
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
                {t.auth.registering}
              </>
            ) : (
              <>
                {t.auth.signUp} <UserPlus className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {t.auth.haveAccount}{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
              {t.auth.signIn}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
