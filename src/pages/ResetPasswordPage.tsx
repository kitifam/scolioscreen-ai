import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scan, Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const th = language === 'th';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user reached here via a valid recovery link
    // Mocked for local storage
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        title: th ? 'กรุณากรอกรหัสผ่านใหม่' : 'Please enter your new password',
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
    setTimeout(() => {
      setIsSubmitting(false);

      toast({
        title: th ? 'ตั้งรหัสผ่านใหม่สำเร็จ!' : 'Password updated successfully!',
        description: th ? 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที' : 'You can now log in with your new password.',
      });
      navigate('/login');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
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
            {th ? 'ตั้งรหัสผ่านใหม่' : 'Reset your password'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {th ? 'กรุณาตั้งรหัสผ่านใหม่สำหรับแอปพลิเคชันคัดกรอง' : 'Please set a new password for your account'}
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{th ? 'รหัสผ่านใหม่' : 'New Password'}</Label>
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
                <Label htmlFor="confirmPassword">{th ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</Label>
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
                {isSubmitting ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึกรหัสผ่านใหม่' : 'Update Password')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
