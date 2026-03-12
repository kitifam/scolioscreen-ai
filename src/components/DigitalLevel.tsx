import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useLanguage } from '@/contexts/LanguageContext';

const DigitalLevel = () => {
  const { gamma, isSupported, isLevel } = useDeviceOrientation();
  const { t } = useLanguage();

  // Don't show on desktop / unsupported
  if (!isSupported || gamma === null) return null;

  const clampedGamma = Math.max(-45, Math.min(45, gamma));
  const offset = (clampedGamma / 45) * 40; // px offset from center

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-20 flex flex-col items-center gap-1">
      {/* Bubble level bar */}
      <div className="relative w-24 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 overflow-hidden">
        {/* Center mark */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60 -translate-x-px" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60 translate-x-px" />
        {/* Bubble */}
        <div
          className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-150 ${
            isLevel
              ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
              : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
          }`}
          style={{
            left: `calc(50% + ${offset}px - 8px)`,
          }}
        />
      </div>
      <span className={`text-[10px] font-medium ${isLevel ? 'text-green-400' : 'text-yellow-400'}`}>
        {isLevel ? '✓' : `${Math.abs(Math.round(clampedGamma))}°`}
      </span>
    </div>
  );
};

export default DigitalLevel;
