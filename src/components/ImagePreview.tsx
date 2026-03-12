import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { RefreshCw, Check } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  stepLabel: string;
  onConfirm: () => void;
  onRetake: () => void;
}

const ImagePreview = ({ imageUrl, stepLabel, onConfirm, onRetake }: ImagePreviewProps) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Header */}
      <div className="shrink-0 bg-black/80 backdrop-blur-sm px-4 py-3 text-center" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <span className="text-white text-sm font-semibold">{stepLabel}</span>
      </div>

      {/* Image */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt="Captured"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Actions — always pinned to bottom */}
      <div
        className="shrink-0 bg-black/80 backdrop-blur-sm px-4 py-4"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3 max-w-sm mx-auto">
          <Button
            variant="outline"
            onClick={onRetake}
            className="flex-1 h-14 rounded-xl border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white active:bg-white/30 text-base"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {t('retake') as string}
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-14 rounded-xl text-base active:scale-95 transition-transform"
          >
            <Check className="h-5 w-5 mr-2" />
            {t('confirm') as string}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
