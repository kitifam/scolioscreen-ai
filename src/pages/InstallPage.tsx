import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, ArrowLeft, Download, Smartphone, Check, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const th = language === 'th';

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {th ? 'กลับ' : 'Back'}
        </button>
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">ScolioScreen AI</span>
        </div>
        <LanguageToggle />
      </header>

      <main className="px-4 py-8 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-xl font-bold">
            {th ? 'ติดตั้งแอป' : 'Install App'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {th ? 'ติดตั้ง ScolioScreen AI ลงหน้าจอ เปิดใช้งานได้เหมือนแอปปกติ' : 'Install ScolioScreen AI to your home screen for quick access.'}
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-success/50 bg-success/5">
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-14 w-14 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-7 w-7 text-success" />
              </div>
              <p className="font-semibold text-success">
                {th ? 'ติดตั้งแล้ว!' : 'Already installed!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {th ? 'เปิดแอปจากหน้าจอหลักได้เลย' : 'Open the app from your home screen.'}
              </p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-14 text-base font-semibold rounded-xl" size="lg">
            <Download className="h-5 w-5 mr-2" />
            {th ? 'ติดตั้งตอนนี้' : 'Install Now'}
          </Button>
        ) : isIOS ? (
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <p className="font-semibold text-sm">
                {th ? 'วิธีติดตั้งบน iPhone / iPad:' : 'How to install on iPhone / iPad:'}
              </p>
              <div className="space-y-3">
                {[
                  { icon: Share2, text: th ? '1. กดปุ่ม Share (แชร์) ที่ด้านล่างของ Safari' : '1. Tap the Share button at the bottom of Safari' },
                  { icon: Download, text: th ? '2. เลือก "เพิ่มไปยังหน้าจอโฮม"' : '2. Select "Add to Home Screen"' },
                  { icon: Check, text: th ? '3. กด "เพิ่ม" เพื่อยืนยัน' : '3. Tap "Add" to confirm' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <p className="text-sm pt-1">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-5 space-y-4">
              <p className="font-semibold text-sm">
                {th ? 'วิธีติดตั้งบน Android:' : 'How to install on Android:'}
              </p>
              <div className="space-y-3">
                {[
                  { text: th ? '1. เปิดเมนู (⋮) ที่มุมขวาบนของ Chrome' : '1. Open the menu (⋮) at the top-right of Chrome' },
                  { text: th ? '2. เลือก "ติดตั้งแอป" หรือ "เพิ่มไปยังหน้าจอหลัก"' : '2. Select "Install app" or "Add to Home screen"' },
                  { text: th ? '3. กด "ติดตั้ง" เพื่อยืนยัน' : '3. Tap "Install" to confirm' },
                ].map(({ text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-accent-foreground">{i + 1}</span>
                    </div>
                    <p className="text-sm pt-1">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-center text-muted-foreground">
            {th ? 'ข้อดีของการติดตั้ง' : 'Benefits'}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              th ? 'เปิดเร็วจากหน้าจอหลัก' : 'Quick launch from home',
              th ? 'ใช้งานได้แม้ไม่มีเน็ต' : 'Works offline',
              th ? 'เหมือนแอปจริง' : 'Native app feel',
              th ? 'ไม่ต้องผ่าน App Store' : 'No app store needed',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/50">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
          {th ? 'ใช้งานผ่านเบราว์เซอร์แทน' : 'Use in browser instead'}
        </Button>
      </main>
    </div>
  );
};

export default InstallPage;
