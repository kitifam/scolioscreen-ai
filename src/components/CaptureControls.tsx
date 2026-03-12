import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SwitchCamera, Upload, Camera } from 'lucide-react';
import type { FacingMode } from '@/hooks/useCamera';
import { useRef } from 'react';

interface CaptureControlsProps {
  onCapture: () => void;
  onFlip: () => void;
  onUpload: (file: File) => void;
  facingMode: FacingMode;
  isReady: boolean;
}

const CaptureControls = ({ onCapture, onFlip, onUpload, facingMode, isReady }: CaptureControlsProps) => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-sm px-4 py-5 safe-area-bottom">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Flip camera */}
        <button
          onClick={onFlip}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          aria-label={t('flipCamera') as string}
        >
          <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
            <SwitchCamera className="h-5 w-5" />
          </div>
          <span className="text-[10px]">
            {facingMode === 'user' ? (t('rearCamera') as string) : (t('frontCamera') as string)}
          </span>
        </button>

        {/* Shutter button */}
        <button
          onClick={onCapture}
          disabled={!isReady}
          className="h-[72px] w-[72px] rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-90"
          aria-label={t('takePhoto') as string}
        >
          <div className="h-14 w-14 rounded-full bg-white hover:bg-white/90 transition-colors flex items-center justify-center">
            <Camera className="h-6 w-6 text-black" />
          </div>
        </button>

        {/* Upload */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleUploadClick}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
            aria-label="Upload Image"
          >
            <div className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-[10px]">{language === 'th' ? 'อัปโหลด' : 'Upload'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureControls;
