import { cn } from '@/lib/utils';
import type { AlignmentState } from '@/hooks/usePoseValidation';

export type OverlayMode = 'upperBody' | 'lowerBody';

interface FramingOverlayProps {
  mode: OverlayMode;
  rotation?: number;
  alignmentState?: AlignmentState;
}

const borderColors: Record<AlignmentState, string> = {
  none: 'border-red-500/80',
  partial: 'border-yellow-400/80',
  aligned: 'border-green-400/80',
};

const cornerColors: Record<AlignmentState, string> = {
  none: 'border-red-500',
  partial: 'border-yellow-400',
  aligned: 'border-green-400',
};

const FramingOverlay = ({ mode, rotation = 0, alignmentState = 'none' }: FramingOverlayProps) => {
  // Silhouette area — very large, nearly full screen
  const silhouetteConfig = {
    upperBody: { top: 1, bottom: 22, left: 5, right: 5 },
    lowerBody: { top: 22, bottom: 1, left: 5, right: 5 },
  };

  // Dashed rectangle — slightly larger than silhouette
  const dashedConfig = {
    upperBody: { top: 0, bottom: 20, left: 3, right: 3 },
    lowerBody: { top: 20, bottom: 0, left: 3, right: 3 },
  };

  const sil = silhouetteConfig[mode];
  const dash = dashedConfig[mode];
  const bColor = borderColors[alignmentState];
  const cColor = cornerColors[alignmentState];

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}
    >
      {/* Semi-transparent overlay outside the dashed frame */}
      <div className="absolute left-0 right-0 top-0 bg-black/40" style={{ height: `${dash.top}%` }} />
      <div className="absolute left-0 right-0 bottom-0 bg-black/40" style={{ height: `${dash.bottom}%` }} />
      <div className="absolute left-0 bg-black/40" style={{ top: `${dash.top}%`, bottom: `${dash.bottom}%`, width: `${dash.left}%` }} />
      <div className="absolute right-0 bg-black/40" style={{ top: `${dash.top}%`, bottom: `${dash.bottom}%`, width: `${dash.right}%` }} />

      {/* Dashed rectangle border — slightly larger */}
      <div
        className={cn('absolute border-2 border-dashed transition-colors duration-300', bColor)}
        style={{ top: `${dash.top}%`, bottom: `${dash.bottom}%`, left: `${dash.left}%`, right: `${dash.right}%` }}
      />

      {/* Corner markers on dashed rectangle */}
      {[
        { vPos: 'top', hPos: 'left' },
        { vPos: 'top', hPos: 'right' },
        { vPos: 'bottom', hPos: 'left' },
        { vPos: 'bottom', hPos: 'right' },
      ].map(({ vPos, hPos }, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-8 h-8 transition-colors duration-300',
            vPos === 'top' && hPos === 'left' && `border-l-[3px] border-t-[3px] ${cColor}`,
            vPos === 'top' && hPos === 'right' && `border-r-[3px] border-t-[3px] ${cColor}`,
            vPos === 'bottom' && hPos === 'left' && `border-l-[3px] border-b-[3px] ${cColor}`,
            vPos === 'bottom' && hPos === 'right' && `border-r-[3px] border-b-[3px] ${cColor}`,
          )}
          style={{
            top: vPos === 'top' ? `calc(${dash.top}% - 1px)` : undefined,
            bottom: vPos === 'bottom' ? `calc(${dash.bottom}% - 1px)` : undefined,
            left: hPos === 'left' ? `calc(${dash.left}% - 1px)` : undefined,
            right: hPos === 'right' ? `calc(${dash.right}% - 1px)` : undefined,
          }}
        />
      ))}

      {/* Silhouette hint — inside the inner frame */}
      <div
        className="absolute flex items-center justify-center opacity-40 w-full h-full"
        style={{ top: `${sil.top}%`, bottom: `${sil.bottom}%`, left: `${sil.left}%`, right: `${sil.right}%` }}
      >
        <SilhouetteSvg mode={mode} />
      </div>
    </div>
  );
};

const SilhouetteSvg = ({ mode }: { mode: OverlayMode }) => {
  if (mode === 'upperBody') {
    return (
      <svg viewBox="0 0 200 260" className="w-full h-full max-h-[85%] text-white drop-shadow-md">
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M85 60 C85 50, 115 50, 115 60 C115 75, 110 80, 100 80 C90 80, 85 75, 85 60 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M85 65 C82 65, 82 72, 85 72 M115 65 C118 65, 118 72, 115 72" />
          <path d="M95 80 L92 90 M105 80 L108 90" />
          <path d="M92 90 C70 90, 60 100, 50 120 L40 180" />
          <path d="M108 90 C130 90, 140 100, 150 120 L160 180" />
          <path d="M60 110 C60 150, 65 170, 70 190 C75 220, 75 240, 75 250" />
          <path d="M140 110 C140 150, 135 170, 130 190 C125 220, 125 240, 125 250" />
          <path d="M85 110 C88 120, 95 125, 100 125 C105 125, 112 120, 115 110" opacity="0.5" strokeWidth="2" />
          <path d="M68 185 C80 190, 120 190, 132 185" opacity="0.6" strokeWidth="2" />
          <line x1="100" y1="50" x2="100" y2="250" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.9" />
        </g>
      </svg>
    );
  }

  return (
    <img
      src="/adam-test-overlay.jpg"
      alt="Adam Test Overlay Guide"
      className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
      style={{ opacity: 1.25, filter: 'contrast(1.5)' }} // Adjusting relative to parent's opacity, increasing contrast for clearer lines
    />
  );
};

export default FramingOverlay;
