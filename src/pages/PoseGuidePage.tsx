import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, ArrowLeft, Camera, CheckCircle, Smartphone, XCircle, Lightbulb } from 'lucide-react';

const PoseGuidePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const th = language === 'th';

  const tips = [
    {
      icon: Smartphone,
      color: 'text-primary',
      text: th ? 'ให้ผู้ช่วยใช้กล้องหลังของมือถือหรือไอแพดถ่ายภาพ' : 'Assistant should use rear camera of mobile phone or iPad',
    },
    {
      icon: CheckCircle,
      color: 'text-success',
      text: th ? 'ให้ผู้ถูกคัดกรองยืนตรง เท้าชิด แขนแนบลำตัว' : 'Subject must stand straight, feet together, arms at sides',
    },
    {
      icon: CheckCircle,
      color: 'text-success',
      text: th ? 'ควรถอดเสื้อ หรือใส่เสื้อแนบเนื้อเพื่อให้เห็นแนวกระดูกสันหลังชัดเจน' : 'Take off shirt or wear tight clothing to clearly see the spine outline',
    },
    {
      icon: CheckCircle,
      color: 'text-success',
      text: th ? 'ถ่ายในที่แสงสว่างเพียงพอ พื้นหลังเรียบ ไม่มีของเกะกะ' : 'Shoot in a well-lit area with a plain background',
    },
    {
      icon: XCircle,
      color: 'text-destructive',
      text: th ? 'ผู้ถูกคัดกรองอย่ายืนบิดตัว เอียงตัว ก้ม หรือเกร็ง' : 'Subject should not twist, lean, or hunch',
    },
  ];

  // SVG Components for Line Art
  const ViewfinderFrame = () => (
    <g stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none">
      <path d="M40 30 L20 30 L20 50" />
      <path d="M160 30 L180 30 L180 50" />
      <path d="M20 210 L20 230 L40 230" />
      <path d="M180 210 L180 230 L160 230" />
      <path d="M95 130 L105 130 M100 125 L100 135" strokeWidth="1" />
    </g>
  );

  const BackViewSvg = () => (
    <svg viewBox="0 0 200 260" className="w-full aspect-[3/4] bg-accent/20 text-foreground">
      <ViewfinderFrame />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Head */}
        <path d="M85 60 C85 50, 115 50, 115 60 C115 75, 110 80, 100 80 C90 80, 85 75, 85 60 Z" fill="currentColor" fillOpacity="0.1" />
        {/* Ears */}
        <path d="M85 65 C82 65, 82 72, 85 72 M115 65 C118 65, 118 72, 115 72" />
        {/* Neck */}
        <path d="M95 80 L92 90 M105 80 L108 90" />
        {/* Shoulders & Torso */}
        <path d="M92 90 C70 90, 60 100, 50 120 L40 180" /> {/* Left Arm */}
        <path d="M108 90 C130 90, 140 100, 150 120 L160 180" /> {/* Right Arm */}
        {/* Body Outline */}
        <path d="M60 110 C60 150, 65 170, 70 190 C75 220, 75 240, 75 250" /> {/* Left side */}
        <path d="M140 110 C140 150, 135 170, 130 190 C125 220, 125 240, 125 250" /> {/* Right side */}
        {/* Back details */}
        <path d="M85 110 C88 120, 95 125, 100 125 C105 125, 112 120, 115 110" opacity="0.4" strokeWidth="1.5" />
        {/* Waist line */}
        <path d="M68 185 C80 190, 120 190, 132 185" opacity="0.5" />

        {/* Grid lines (red) from example */}
        <line x1="100" y1="90" x2="100" y2="190" stroke="hsl(var(--destructive))" strokeWidth="1.5" opacity="0.7" />
        <line x1="45" y1="110" x2="155" y2="110" stroke="hsl(var(--destructive))" strokeWidth="1.5" opacity="0.7" />
        <line x1="65" y1="50" x2="65" y2="250" stroke="hsl(var(--destructive))" strokeWidth="1" opacity="0.4" />
        <line x1="135" y1="50" x2="135" y2="250" stroke="hsl(var(--destructive))" strokeWidth="1" opacity="0.4" />
      </g>
    </svg>
  );

  const AdamTestSideSvg = () => (
    <svg viewBox="0 0 200 260" className="w-full aspect-[3/4] bg-accent/20 text-foreground">
      <ViewfinderFrame />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Legs - Solid style */}
        <path d="M90 240 L90 145 C90 135, 110 135, 110 145 L110 240" fill="currentColor" fillOpacity="0.1" />

        {/* Bent Torso - More defined shape (matching Image 1) */}
        <path d="M105 145 C105 130, 115 120, 135 115 C160 110, 185 125, 190 150 C195 170, 185 185, 170 190" fill="currentColor" fillOpacity="0.15" />

        {/* Head hanging down - Clearly defined */}
        <circle cx="165" cy="180" r="15" fill="currentColor" fillOpacity="0.2" />
        <path d="M170 190 C165 195, 155 195, 150 185" />

        {/* Arms hanging down - Natural look */}
        <path d="M160 135 L160 215" strokeWidth="4" opacity="0.8" />

        {/* Skeleton/Spine overlay within the body */}
        <path d="M105 145 C110 130, 130 120, 160 125 C185 130, 190 150, 175 175" stroke="hsl(var(--destructive))" strokeWidth="2" strokeDasharray="3 5" opacity="0.9" />
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/consent')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{th ? 'กลับ' : 'Back'}</span>
          </button>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold hidden sm:block">ScolioScreen AI</span>
          </div>
        </div>
        <UserDisplay />
        <div className="flex items-center gap-1">
          <LogoutToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">
            {th ? 'ท่าถ่ายที่ถูกต้อง' : 'Correct Posture Guide'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {th ? 'ปฏิบัติตามคำแนะนำเพื่อผลคัดกรองที่แม่นยำ' : 'Follow these guidelines for accurate screening results'}
          </p>
        </div>

        {/* Photo examples */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50 overflow-hidden relative group">
            <CardContent className="p-0">
              <div className="relative">
                <BackViewSvg />
                <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-md px-3 py-2 border-t border-border/50">
                  <span className="text-foreground text-xs font-bold flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    {th ? 'ท่าหันหลัง' : 'Back View'}
                  </span>
                  <p className="text-muted-foreground text-[10.5px] mt-0.5 font-medium">
                    {th ? 'ใช้กล้องหลังถ่ายเต็มตัว' : 'Use rear camera'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 overflow-hidden relative group">
            <CardContent className="p-0">
              <div className="relative">
                <img src="/adam-test-guide.jpg" alt="Adam Test Guide" className="w-full h-auto block" />
                <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-md px-3 py-2 border-t border-border/50">
                  <span className="text-foreground text-xs font-bold flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    {th ? 'ท่าก้มตัว (Adam Test)' : 'Adam Test'}
                  </span>
                  <p className="text-muted-foreground text-[10.5px] mt-0.5 font-medium">
                    {th ? 'ใช้กล้องหลังถ่ายแผ่นหลังขณะก้มตัว' : 'Capture back while bending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold">
                {th ? 'คำแนะนำสำคัญ' : 'Important Tips'}
              </span>
            </div>
            <div className="space-y-2.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <tip.icon className={`h-4 w-4 shrink-0 mt-0.5 ${tip.color}`} />
                  <span className="text-sm leading-relaxed">{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto-capture info */}
        <Card className="bg-accent/40 border-accent">
          <CardContent className="p-4">
            <p className="text-xs text-accent-foreground leading-relaxed">
              {th
                ? '💡 ระบบจะถ่ายภาพอัตโนมัติเมื่อยืนในตำแหน่งที่ถูกต้อง (กรอบเปลี่ยนเป็นสีเขียว) หรือคุณสามารถกดปุ่มถ่ายเองได้'
                : '💡 The system will auto-capture when you\'re in the correct position (frame turns green). You can also tap the shutter button manually.'}
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={() => navigate('/capture')}
          className="w-full h-14 text-base font-semibold rounded-xl"
          size="lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          {th ? 'เริ่มถ่ายภาพ' : 'Start Capture'}
        </Button>
      </main>
    </div>
  );
};

export default PoseGuidePage;
