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
import { Card, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock, Scan, User } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const th = language === 'th';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) {
      toast({
        title: th ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: th ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: th ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(async () => {
      const { error } = await signUp(email, password, username);

      setIsSubmitting(false);

      if (error) {
        toast({
          title: th ? 'ไม่สามารถลงทะเบียนได้' : 'Registration failed',
          description: error.message === 'User already exists'
            ? (th ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'This email is already in use')
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: th ? 'ลงทะเบียนสำเร็จ!' : 'Registration successful!',
          description: th ? 'สร้างบัญชีเรียบร้อยแล้ว' : 'Your account has been created.',
        });
        navigate('/');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
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
            {th ? 'ลงทะเบียนผู้ใช้ใหม่' : 'Create an account'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {th ? 'สร้างบัญชีเพื่อเริ่มต้นใช้งานระบบคัดกรอง' : 'Enter your details below to secure your account'}
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
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
                <Label htmlFor="username">{th ? 'ชื่อผู้ใช้งาน' : 'Username'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={th ? 'เช่น สมชาย' : 'e.g. John Doe'}
                    className="pl-9 h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{th ? 'รหัสผ่าน' : 'Password'}</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{th ? 'ยืนยันรหัสผ่าน' : 'Confirm Password'}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 mt-2" disabled={isSubmitting}>
                {isSubmitting ? (th ? 'กำลังสร้างบัญชี...' : 'Creating account...') : (th ? 'สมัครสมาชิก' : 'Sign Up')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4 pb-4">
            <p className="text-sm text-muted-foreground">
              {th ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {th ? 'เข้าสู่ระบบ' : 'Sign in'}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div >
  );
};

export default RegisterPage;
