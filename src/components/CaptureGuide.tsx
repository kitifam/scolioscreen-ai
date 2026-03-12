import { useLanguage } from '@/contexts/LanguageContext';
import { Progress } from '@/components/ui/progress';
import type { OverlayMode } from '@/components/FramingOverlay';
import type { AlignmentState } from '@/hooks/usePoseValidation';

interface CaptureGuideProps {
  currentStep: number;
  mode: OverlayMode;
  tiltWarning?: boolean;
  brightnessWarning?: boolean;
  poseLoading?: boolean;
  alignmentState?: AlignmentState;
  poseFeedbackKey?: string | null;
}

const CaptureGuide = ({ currentStep, mode, tiltWarning, brightnessWarning, poseLoading, alignmentState = 'none', poseFeedbackKey }: CaptureGuideProps) => {
  const { t, language } = useLanguage();

  const guideKeys: Record<OverlayMode, 'guideUpperBody' | 'guideLowerBody'> = {
    upperBody: 'guideUpperBody',
    lowerBody: 'guideLowerBody',
  };

  const modeLabels: Record<OverlayMode, 'photoUpperBody' | 'photoLowerBody'> = {
    upperBody: 'photoUpperBody',
    lowerBody: 'photoLowerBody',
  };

  const stateColors: Record<AlignmentState, string> = {
    none: 'text-red-400',
    partial: 'text-yellow-400',
    aligned: 'text-green-400',
  };

  const stateBgColors: Record<AlignmentState, string> = {
    none: 'bg-red-500/20 border-red-500/40',
    partial: 'bg-yellow-500/20 border-yellow-500/40',
    aligned: 'bg-green-500/20 border-green-500/40',
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-sm px-4 py-3 safe-area-top space-y-2">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-white text-sm font-bold whitespace-nowrap">
          {t('photoOf') as string} {currentStep + 1}/2
        </span>
        <Progress value={((currentStep + 1) / 2) * 100} className="h-2 flex-1 bg-white/20" />
      </div>

      {/* Mode label + guide */}
      <div className="space-y-1">
        <span className="text-white text-lg font-bold">
          {t(modeLabels[mode]) as string}
        </span>
        <p className="text-white/90 text-sm leading-relaxed font-medium">
          {t(guideKeys[mode]) as string}
        </p>
      </div>

      {/* Pose feedback — larger and more visible */}
      {poseLoading && (
        <div className="text-white/80 text-sm font-semibold px-4 py-2 rounded-xl bg-white/10 border border-white/20">
          ⏳ {language === 'th' ? 'กำลังเตรียมระบบตรวจจับ...' : 'Loading pose detection...'}
        </div>
      )}
      {!poseLoading && poseFeedbackKey && (
        <div className={`text-base font-bold px-4 py-2.5 rounded-xl border ${stateColors[alignmentState]} ${stateBgColors[alignmentState]}`}>
          {alignmentState === 'aligned' ? '✅' : alignmentState === 'partial' ? '⚠️' : '🔴'}{' '}
          {t(poseFeedbackKey as any) as string}
        </div>
      )}

      {/* Warnings */}
      {tiltWarning && (
        <div className="bg-yellow-500/90 text-black text-sm font-bold px-4 py-2 rounded-xl">
          📐 {t('tiltWarning') as string}
        </div>
      )}
      {brightnessWarning && (
        <div className="bg-yellow-500/90 text-black text-sm font-bold px-4 py-2 rounded-xl">
          💡 {t('brightnessLow') as string}
        </div>
      )}
    </div>
  );
};

export default CaptureGuide;
