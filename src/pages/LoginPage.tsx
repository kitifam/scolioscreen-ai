import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock, Scan } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const th = language === 'th';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: th ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      const { error } = await signIn(email, password);

      setIsSubmitting(false);

      if (error) {
        toast({
          title: th ? 'เข้าสู่ระบบไม่สำเร็จ' : 'Login failed',
          description: th ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากยังไม่มีบัญชี กรุณาลงทะเบียนก่อน)' : "Invalid email or password. (If you don't have an account, please sign up first).",
          variant: 'destructive',
        });
      } else {
        navigate('/');
      }
    }, 500);
  };

  const handleGoogleLogin = async () => {
    // Generate a dummy user for Google login via Local Storage
    const googleEmail = `google-user-${Math.floor(Math.random() * 1000)}@gmail.com`;
    // For demo: Google login auto-signs up if not exists
    await signUp(googleEmail);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </button>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold hidden sm:block">{t('appName')}</span>
          </div>
        </div>
        <UserDisplay />
        <div className="flex items-center gap-1">
          <LogoutToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 max-w-sm mx-auto w-full py-8">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {th ? 'เข้าสู่ระบบ' : 'Sign in to your account'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {th ? 'เข้าสู่ระบบบัญชีของคุณเพื่อเริ่มต้นคัดกรอง' : 'Enter your details below to sign in'}
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{th ? 'อีเมล' : 'Email'}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{th ? 'รหัสผ่าน' : 'Password'}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {th ? 'ลืมรหัสผ่าน?' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? (th ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...') : (th ? 'เข้าสู่ระบบ' : 'Sign In')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {th ? 'หรือดำเนินการต่อด้วย' : 'Or continue with'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full h-11 bg-background"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.26v2.84C4.09 20.61 7.74 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.26C1.5 8.58 1 10.24 1 12s.5 3.42 1.26 4.93l3.58-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.74 1 4.09 3.39 2.26 7.07l3.58 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              {th ? 'ยังไม่มีบัญชีใช่มั้ย?' : "Don't have an account?"}{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                {th ? 'ลงทะเบียน' : 'Sign up'}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;
