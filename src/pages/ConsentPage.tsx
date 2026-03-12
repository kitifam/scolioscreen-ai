import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scan, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConsentPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [consent, setConsent] = useState(false);
  const [minorConsent, setMinorConsent] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const currentYear = new Date().getFullYear();
  const calculatedAge = birthYear ? currentYear - parseInt(birthYear) : null;
  const isMinor = calculatedAge !== null && calculatedAge < 18;

  useEffect(() => {
    if (profile) {
      if (profile.birth_year) setBirthYear(profile.birth_year.toString());
      if (profile.sex) setSex(profile.sex);
      if (profile.height) setHeight(profile.height.toString());
      if (profile.weight) setWeight(profile.weight.toString());
      if (profile.symptoms) setSymptoms(profile.symptoms);
      if (profile.consent_given) setConsent(true);
    }
  }, [profile]);

  const handleSubmit = async () => {
    if (!consent) {
      toast({ title: t('mustAcceptConsent') as string, variant: 'destructive' });
      return;
    }
    if (isMinor && !minorConsent) {
      toast({
        title: language === 'th' ? 'กรุณาให้ผู้ปกครองยินยอม' : 'Parent/guardian consent required',
        variant: 'destructive',
      });
      return;
    }
    const birthYearNum = parseInt(birthYear);
    if (!birthYear || isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
      toast({ title: t('invalidBirthYear') as string, variant: 'destructive' });
      return;
    }
    if (!sex) {
      toast({ title: t('requiredField') as string, variant: 'destructive' });
      return;
    }

    const age = currentYear - birthYearNum;
    const info = { age, birth_year: birthYearNum, sex, height: height || null, weight: weight || null, symptoms: symptoms || null };

    // Save to session storage for the AI analysis
    sessionStorage.setItem('scolioscreen_userinfo', JSON.stringify(info));

    // Save to database permanently if logged in
    if (user) {
      setIsSubmitting(true);

      try {
        await updateProfile({
          birth_year: birthYearNum,
          sex,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          symptoms: symptoms || undefined,
          consent_given: true,
        });
      } catch (error: any) {
        console.error('Error saving profile:', error);
        toast({
          title: language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' : 'Error saving profile',
          description: error.message,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
    }

    navigate('/guide');
  };

  const consentTerms = t('consentTerms') as string[];

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

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {isMinor && (
              <Card className="bg-accent/50 border-accent">
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-semibold text-accent-foreground">{t('minorSection') as string}</p>
                  <div className="flex items-start gap-3">
                    <Checkbox id="minorConsent" checked={minorConsent} onCheckedChange={(c) => setMinorConsent(c === true)} className="mt-0.5" />
                    <Label htmlFor="minorConsent" className="text-xs leading-relaxed cursor-pointer">
                      {t('minorConsent') as string}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

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
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('consentTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('consentIntro') as string}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {consentTerms.map((term, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c === true)} className="mt-0.5" />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  {t('consentAgree') as string}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} className="w-full h-12 text-base font-semibold rounded-xl" disabled={!consent || isSubmitting}>
          {isSubmitting ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (t('startCapture') as string)}
        </Button>
      </main>
    </div>
  );
};

export default ConsentPage;
