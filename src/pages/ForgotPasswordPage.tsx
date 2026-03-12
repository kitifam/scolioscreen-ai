import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Scan } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const th = language === 'th';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: th ? 'กรุณากรอกอีเมล' : 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: th ? 'ส่งข้อมูลสำเร็จ' : 'Success',
        description: th ? 'ส่งลิงก์จำลองแล้ว (ไม่ต้องเช็คอีเมลจริง)' : 'Mock link sent (no real email check).',
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
        <button onClick={() => navigate('/login')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t('back')}</span>
        </button>
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold hidden sm:block">{t('appName')}</span>
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
            {th ? 'ลืมรหัสผ่าน?' : 'Forgot your password?'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {th
              ? 'กรอกอีเมลที่คุณใช้ลงทะเบียนเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่านใหม่'
              : "Enter your registered email and we'll send you a link to reset your password"}
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            {!isSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
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

                <Button type="submit" className="w-full h-11 mt-2" disabled={isSubmitting}>
                  {isSubmitting
                    ? (th ? 'กำลังส่งข้อมูล...' : 'Sending link...')
                    : (th ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : 'Send reset link')}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{th ? 'ส่งลิงก์สำเร็จ' : 'Link sent successfully!'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {th
                      ? 'โปรดตรวจสอบกล่องจดหมายอีเมลของคุณเพื่อดำเนินการต่อ'
                      : 'Please check your email inbox to proceed.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-11 mt-2"
                  onClick={() => navigate('/login')}
                >
                  {th ? 'กลับไปหน้าเข้าสู่ระบบ' : 'Back to log in'}
                </Button>
              </div>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex justify-center border-t border-border/50 pt-4 pb-4">
              <p className="text-sm text-muted-foreground">
                {th ? 'คิดรหัสผ่านออกแล้ว?' : 'Remembered your password?'}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {th ? 'เข้าสู่ระบบ' : 'Sign in'}
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
