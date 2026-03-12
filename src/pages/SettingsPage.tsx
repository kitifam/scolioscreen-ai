import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Scan, Save, Trash2, LogOut } from 'lucide-react';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile, refreshProfile, signOut, updateProfile, updateUsername } = useAuth();
  const { toast } = useToast();

  const [userName, setUserName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const calculatedAge = birthYear ? currentYear - parseInt(birthYear) : null;

  useEffect(() => {
    if (user?.username) setUserName(user.username);
    if (profile) {
      if (profile.birth_year) setBirthYear(profile.birth_year.toString());
      if (profile.sex) setSex(profile.sex);
      if (profile.height) setHeight(profile.height.toString());
      if (profile.weight) setWeight(profile.weight.toString());
      if (profile.symptoms) setSymptoms(profile.symptoms);
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;

    const birthYearNum = parseInt(birthYear);
    if (!birthYear || isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
      toast({ title: t('invalidBirthYear') as string, variant: 'destructive' });
      return;
    }
    if (!sex) {
      toast({ title: t('requiredField') as string, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const age = currentYear - birthYearNum;
    try {
      if (userName && userName !== user.username) {
        await updateUsername(userName);
      }

      await updateProfile({
        birth_year: birthYearNum,
        sex,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        symptoms: symptoms || undefined,
        consent_given: true,
      });
      await refreshProfile();
      toast({
        title: language === 'th' ? 'บันทึกข้อมูลเรียบร้อย' : 'Profile updated successfully',
      });

      const info = { age, birth_year: birthYearNum, sex, height: height || null, weight: weight || null, symptoms: symptoms || null };
      sessionStorage.setItem('scolioscreen_userinfo', JSON.stringify(info));

      navigate('/');
    } catch (error: any) {
      toast({
        title: language === 'th' ? 'บันทึกข้อมูลไม่สำเร็จ' : 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleClearData = () => {
    if (!user) return;
    const confirm = window.confirm(
      language === 'th'
        ? 'คุณต้องการลบประวัติส่วนตัวและผลการวิเคราะห์ทั้งหมดหรือไม่? (ข้อมูลจะหายไปถาวร)'
        : 'Do you want to delete all personal history and analysis results? (Data will be permanently lost)'
    );

    if (confirm) {
      localStorage.removeItem(`scolioscreen_profile_${user.id}`);
      localStorage.removeItem(`scolioscreen_screenings_${user.id}`);
      refreshProfile();
      toast({
        title: language === 'th' ? 'ลบข้อมูลสำเร็จ' : 'Data cleared successfully',
      });
      navigate('/');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{t('settings')}</h1>
          <p className="text-sm text-muted-foreground">{t('editProfile') as string}</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg">{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="userName" className="text-sm">{language === 'th' ? 'ชื่อผู้ใช้งาน' : 'Username'}</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={language === 'th' ? 'กรุณาใส่ชื่อของคุณ' : 'Enter your username'}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="birthYear" className="text-sm">{t('birthYear')}</Label>
                <Input
                  id="birthYear"
                  type="number"
                  min="1900"
                  max={currentYear}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="2010"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t('age')}</Label>
                <div className="h-11 flex items-center px-3 rounded-md border border-input bg-muted/50 text-muted-foreground font-medium">
                  {calculatedAge !== null ? `${calculatedAge} ${language === 'th' ? 'ปี' : 'years'}` : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t('sex')}</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('male') as string}</SelectItem>
                  <SelectItem value="female">{t('female') as string}</SelectItem>
                  <SelectItem value="other">{t('other') as string}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t('height')}</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="165" className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t('weight')}</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="55" className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">{t('symptoms')}</Label>
              <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t('symptomsPlaceholder') as string} className="min-h-[80px]" />
            </div>

            <Button onClick={handleSave} className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
              <Scan className="h-4 w-4 mr-2" />
              {t('saveChanges')}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <div className="space-y-4 pt-4">
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-warning">
                <Trash2 className="h-4 w-4" />
                <h3 className="font-semibold text-sm">
                  {language === 'th' ? 'จัดการข้อมูล' : 'Data Management'}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'th'
                  ? 'ลบประวัติข้อมูลพื้นฐานและผลการวิเคราะห์เฉพาะบัญชีนี้ ข้อมูลจะถูกลบออกจากเครื่องนี้ทันที'
                  : 'Clear basic info history and analysis results for this account. Data will be removed from this device.'}
              </p>
              <Button
                variant="outline"
                onClick={handleClearData}
                className="w-full h-11 border-warning text-warning hover:bg-warning/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'th' ? 'ลบข้อมูลประวัติส่วนตัว' : 'Clear History Data'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                <h3 className="font-semibold text-sm">
                  {language === 'th' ? 'ออกจากโปรแกรม' : 'Exit Program'}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'th' ? 'ออกจากระบบและกลับไปยังหน้าเริ่มต้น' : 'Sign out and go to home page'}
              </p>
              <Button variant="destructive" onClick={handleLogout} className="w-full h-11">
                <LogOut className="h-4 w-4 mr-2" />
                {language === 'th' ? 'ออกจากโปรแกรม' : 'Exit Program'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
