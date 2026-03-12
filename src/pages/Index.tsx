import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Scan, Camera, ShieldCheck, Clock, Languages, Lock,
  Download, ArrowRight, AlertTriangle, Zap, Eye, Heart, Settings, TrendingUp
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const th = language === 'th';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Scan className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:block">{t('appName')}</span>
        </div>

        <UserDisplay />

        <div className="flex items-center gap-1.5">
          {user && (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('settings')}</span>
            </button>
          )}

          <LogoutToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="px-4 max-w-lg mx-auto">

        {/* ========== SECTION 1: VIRAL HOOK ========== */}
        <section className="py-10 text-center space-y-6">
          {/* Animated spine illustration */}
          <div className="mx-auto w-32 animate-float">
            <svg viewBox="0 0 120 200" className="w-full h-auto drop-shadow-lg">
              <ellipse cx="58" cy="22" rx="12" ry="14" className="text-primary/20" fill="currentColor" />
              <path d="M52 36 Q54 42 52 48 L62 48 Q60 42 62 36 Z" className="text-primary/15" fill="currentColor" />
              <path d="M42 48 Q38 70 40 100 Q42 120 44 140 L64 140 Q66 120 68 100 Q72 70 66 48 Z" className="text-primary/15" fill="currentColor" />
              <path d="M60 52 Q68 70 66 95 Q64 100 60 100 Q62 75 56 56 Z" className="text-primary/10" fill="currentColor" />
              <path d="M46 52 Q38 70 40 95 Q42 100 46 100 Q44 75 50 56 Z" className="text-primary/12" fill="currentColor" />
              <path d="M44 140 Q42 160 44 185 L54 185 Q56 160 54 140 Z" className="text-primary/15" fill="currentColor" />
              <path d="M54 140 Q56 160 54 185 L64 185 Q62 160 60 140 Z" className="text-primary/12" fill="currentColor" />
              <path d="M38 185 L54 185 L54 191 Q48 194 38 192 Z" className="text-primary/15" fill="currentColor" />
              <path d="M50 185 L64 185 L64 191 Q58 194 50 192 Z" className="text-primary/12" fill="currentColor" />
              {/* Animated spine dots */}
              {[36, 48, 60, 72, 84, 96, 108, 120, 132].map((y, i) => (
                <circle
                  key={i}
                  cx="55"
                  cy={y}
                  r="2.5"
                  fill="hsl(var(--primary))"
                  className="animate-spine-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
              <line x1="55" y1="18" x2="55" y2="140" stroke="hsl(var(--primary))" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.3" />
            </svg>
          </div>

          {/* Hook headline */}
          <div className="space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              {th ? 'เด็กไทย 3-5% มีภาวะกระดูกสันหลังคด' : '3-5% of children have scoliosis'}
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-[1.2]">
              {th ? (
                <>
                  คัดกรองกระดูกสันหลังคด
                  <br />
                  <span className="text-primary">ง่ายๆ แค่ถ่ายรูป</span>
                </>
              ) : (
                <>
                  Screen for Scoliosis
                  <br />
                  <span className="text-primary">Just Take a Photo</span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
              {th
                ? 'ไม่ต้องไปโรงพยาบาล ไม่ต้องสมัครสมาชิก AI วิเคราะห์ให้ภายใน 1 นาที'
                : 'No hospital visit. No sign-up. AI analyzes in under 1 minute.'}
            </p>
          </div>
        </section>

        {/* ========== SECTION 2: THE TWIST — Why this matters ========== */}
        <section className="py-6 space-y-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-destructive" />
                <h2 className="font-bold text-sm">
                  {th ? 'ทำไมต้องคัดกรองเร็ว?' : 'Why Screen Early?'}
                </h2>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  {th
                    ? '🔴 กระดูกสันหลังคดระยะเริ่มต้น ไม่มีอาการเจ็บปวด ไม่สังเกตด้วยตาเปล่า'
                    : '🔴 Early-stage scoliosis is painless and invisible to the naked eye'}
                </p>
                <p>
                  {th
                    ? '🔴 หากพบช้า อาจต้องผ่าตัดซึ่งมีค่าใช้จ่ายสูงมาก'
                    : '🔴 Late detection may require expensive surgery'}
                </p>
                <p className="font-semibold text-foreground">
                  {th
                    ? '✅ พบเร็ว = รักษาง่าย ด้วยกายภาพบำบัดหรือเสื้อดัด'
                    : '✅ Early detection = simple treatment with bracing or therapy'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========== SECTION 3: CLIMAX — How it works ========== */}
        <section className="py-6 space-y-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <h2 className="text-center font-bold text-base text-foreground">
            {th ? '3 ขั้นตอนง่ายๆ' : '3 Simple Steps'}
          </h2>

          <div className="space-y-3">
            {[
              {
                num: '1',
                icon: ShieldCheck,
                title: th ? 'ให้ความยินยอม' : 'Give Consent',
                desc: th ? 'กรอกข้อมูลพื้นฐาน อายุ เพศ' : 'Enter basic info: age, sex',
                color: 'bg-primary/10 text-primary',
              },
              {
                num: '2',
                icon: Camera,
                title: th ? 'ถ่ายภาพ 2 รูป' : 'Take 2 Photos',
                desc: th ? 'ระบบ AI ช่วยจัดท่า ถ่ายอัตโนมัติเมื่อท่าตรง' : 'AI guides your pose, auto-captures when aligned',
                color: 'bg-accent text-accent-foreground',
              },
              {
                num: '3',
                icon: Zap,
                title: th ? 'รับผลทันที' : 'Get Instant Results',
                desc: th ? 'AI วิเคราะห์ความเสี่ยง พร้อมคำแนะนำ' : 'AI analyzes risk with clear recommendations',
                color: 'bg-success/15 text-success',
              },
            ].map((step, i) => (
              <Card
                key={step.num}
                className="border-border/50 opacity-0 animate-fade-up overflow-hidden"
                style={{ animationDelay: `${0.7 + i * 0.15}s`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`h-11 w-11 rounded-xl ${step.color} flex items-center justify-center shrink-0 font-bold text-lg`}>
                      {step.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                    <step.icon className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ========== SECTION 4: SOCIAL PROOF — Stats ========== */}
        <section className="py-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: th ? '<1 นาที' : '<1 min', label: th ? 'รู้ผล' : 'Results', icon: Clock },
              { value: th ? 'ฟรี' : 'Free', label: th ? 'ไม่มีค่าใช้จ่าย' : 'No cost', icon: Heart },
              { value: th ? '100%' : '100%', label: th ? 'ส่วนตัว' : 'Private', icon: Lock },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-accent/40 rounded-xl p-3 space-y-1 opacity-0 animate-count-up"
                style={{ animationDelay: `${1.1 + i * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <stat.icon className="h-4 w-4 mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== SECTION 5: FEATURES & PROGRESS ========== */}
        <section className="py-4 opacity-0 animate-slide-up" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: ShieldCheck, text: t('feature1') as string },
              { icon: Clock, text: t('feature2') as string },
              { icon: Languages, text: t('feature3') as string },
              { icon: Lock, text: t('feature4') as string },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border border-border/50 rounded-xl p-3">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="text-[11px] font-medium leading-tight text-foreground">{text}</span>
              </div>
            ))}
          </div>

          {user && (
            <Card
              className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors group overflow-hidden"
              onClick={() => navigate('/progress')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{t('trackProgress')}</h3>
                    <p className="text-[10px] text-muted-foreground">{th ? 'บันทึกอาการและดูความคืบหน้า' : 'Log symptoms and see progress'}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          )}
        </section>

        {/* ========== SECTION 6: CTA ========== */}
        <section className="py-8 space-y-4 opacity-0 animate-slide-up" style={{ animationDelay: '1.3s', animationFillMode: 'forwards' }}>
          {user ? (
            <Button
              onClick={() => {
                if (profile?.consent_given) {
                  // Synchronize database to sessionStorage for analysis
                  const updates = {
                    age: profile.age,
                    sex: profile.sex,
                    height: profile.height || null,
                    weight: profile.weight || null,
                    symptoms: profile.symptoms || null
                  };
                  sessionStorage.setItem('scolioscreen_userinfo', JSON.stringify(updates));
                  navigate('/guide');
                } else {
                  navigate('/consent');
                }
              }}
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/25 animate-pulse-glow"
              size="lg"
            >
              {th ? '🩺 เริ่มคัดกรองเลย' : '🩺 Start Screening'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/25 animate-pulse-glow"
              size="lg"
            >
              {th ? 'เข้าสู่ระบบเพื่อเริ่มคัดกรอง' : 'Sign in to Start'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            {th
              ? 'ระบบคัดกรองโดย AI • ข้อมูลของคุณเป็นส่วนตัว • ใช้ได้ทุกมือถือ'
              : 'AI Screening • Your data is private • Works on any phone'}
          </p>
        </section>

        {/* Disclaimer */}
        <section className="pb-8">
          <Card className="bg-accent/30 border-accent">
            <CardContent className="p-3">
              <p className="text-[11px] text-accent-foreground leading-relaxed">
                {t('disclaimer') as string}
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
};

export default Index;
