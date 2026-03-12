import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCamera } from '@/hooks/useCamera';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { usePoseValidation } from '@/hooks/usePoseValidation';
import { useQualityChecks } from '@/hooks/useQualityChecks';
import { useToast } from '@/hooks/use-toast';
import FramingOverlay, { type OverlayMode } from '@/components/FramingOverlay';
import CaptureGuide from '@/components/CaptureGuide';
import CaptureControls from '@/components/CaptureControls';
import ScoliosisOverlay, { type StandingMetrics } from '@/components/ScoliosisOverlay';
import AdamTestOverlay from '@/components/AdamTestOverlay';
import AutoCaptureCountdown from '@/components/AutoCaptureCountdown';
import QualityWarnings from '@/components/QualityWarnings';
import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import DigitalLevel from '@/components/DigitalLevel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, ArrowLeft, Send, RefreshCw, Check, X } from 'lucide-react';

const MODES: OverlayMode[] = ['upperBody', 'lowerBody'];
const MODE_LABELS_TH = ['ท่าหันหลัง', 'ท่าก้มตัว (Adam Test)'];
const MODE_LABELS_EN = ['Back View', 'Adam Forward Bend'];

const CapturePage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const camera = useCamera();

  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([null, null]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [autoCountdownActive, setAutoCountdownActive] = useState(false);
  const alignedSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!cameraStarted) {
      camera.startCamera();
      setCameraStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pose = usePoseDetection(camera.videoRef, camera.isReady && !previewImage);
  const validation = usePoseValidation(pose.landmarks, MODES[currentStep]);

  const quality = useQualityChecks({
    videoRef: camera.videoRef,
    landmarks: pose.landmarks,
    mode: MODES[currentStep],
    cameraReady: camera.isReady && !previewImage,
    enabled: camera.isReady && !previewImage,
  });

  // Update pose count for multi-person detection
  useEffect(() => {
    quality.updatePoseCount(pose.poseCount);
  }, [pose.poseCount, quality.updatePoseCount]);

  // Auto-capture: only when aligned AND quality is good
  useEffect(() => {
    if (previewImage || autoCountdownActive) return;

    if (validation.state === 'aligned' && quality.canCapture) {
      if (!alignedSinceRef.current) {
        alignedSinceRef.current = Date.now();
      }
      const elapsed = Date.now() - alignedSinceRef.current;
      if (elapsed >= 1500) {
        setAutoCountdownActive(true);
        return;
      }
      const timer = setTimeout(() => {
        if (alignedSinceRef.current) {
          const now = Date.now() - alignedSinceRef.current;
          if (now >= 1500) setAutoCountdownActive(true);
        }
      }, 1500 - elapsed + 50);
      return () => clearTimeout(timer);
    } else {
      alignedSinceRef.current = null;
    }
  }, [validation.state, quality.canCapture, previewImage, autoCountdownActive]);

  // Cancel countdown if quality degrades
  useEffect(() => {
    if (autoCountdownActive && !quality.canCapture) {
      setAutoCountdownActive(false);
      alignedSinceRef.current = null;
    }
  }, [autoCountdownActive, quality.canCapture]);

  const lastValidLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  useEffect(() => {
    if (pose.landmarks) lastValidLandmarksRef.current = pose.landmarks;
  }, [pose.landmarks]);

  useEffect(() => {
    setAutoCountdownActive(false);
    alignedSinceRef.current = null;
  }, [currentStep, previewImage]);

  const [capturedLandmarks, setCapturedLandmarks] = useState<NormalizedLandmark[] | null>(null);

  const doCapture = useCallback(() => {
    const img = camera.captureImage();
    if (img) {
      setPreviewImage(img);
      setCapturedLandmarks(pose.landmarks || lastValidLandmarksRef.current);
      setAutoCountdownActive(false);
    }
  }, [camera, pose.landmarks]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (file: File) => {
    const resizedImg = await resizeImage(file);
    setPreviewImage(resizedImg);

    // Detect landmarks for uploaded image
    const imgElement = new Image();
    imgElement.onload = async () => {
      const lms = await pose.detectFromImage(imgElement);
      if (lms) {
        setCapturedLandmarks(lms);
      } else {
        toast({
          title: language === 'th' ? 'แจ้งเตือน' : 'Notification',
          description: language === 'th' ? 'ไม่พบตำแหน่งร่างกายในรูปภาพ โปรดระบุจุดด้วยตนเอง' : 'No landmarks detected in image. Please place points manually.',
        });
        // Provide empty landmarks for ScoliosisOverlay to allow manual placement
        // For Adam test, it already handles empty points.
        if (currentStep === 0) setCapturedLandmarks(new Array(33).fill({ x: 0.5, y: 0.5, z: 0 }));
      }
    };
    imgElement.src = resizedImg;
  };

  const handleStandingConfirm = (metrics: StandingMetrics) => {
    setCapturedImages(prev => {
      const next = [...prev];
      next[0] = previewImage;
      return next;
    });
    sessionStorage.setItem('scolioscreen_back_landmarks', JSON.stringify(metrics.landmarks));
    if (metrics.annotatedImage) {
      sessionStorage.setItem('scolioscreen_annotated_back', metrics.annotatedImage);
    }
    setPreviewImage(null);
    setCapturedLandmarks(null);
    setCurrentStep(1);
    toast({ title: t('photoSaved') as string });
  };

  const handleAdamReady = (data: { angle: number; level: { th: string; en: string }; isAbnormal: boolean; annotatedImage?: string }) => {
    // Save Adam metrics
    sessionStorage.setItem('scolioscreen_adam_metrics', JSON.stringify({
      angle: data.angle, level: data.level, isAbnormal: data.isAbnormal
    }));
    
    // Save the array of images (Standing Back, Adam Test)
    const finalImages = [capturedImages[0], previewImage];
    sessionStorage.setItem('scolioscreen_images', JSON.stringify(finalImages));
    
    if (data.annotatedImage) {
      sessionStorage.setItem('scolioscreen_annotated_adam', data.annotatedImage);
    }

    // Clean up state
    setPreviewImage(null);
    setCapturedLandmarks(null);
    toast({ title: t('photoSaved') as string });

    // Navigate immediately to result
    navigate('/result');
  };

  const handleRetake = useCallback(() => {
    setPreviewImage(null);
    setCapturedLandmarks(null);
  }, []);

  const modeLabels = language === 'th' ? MODE_LABELS_TH : MODE_LABELS_EN;

  // Error state
  if (camera.error) {
    let errorMsg = t('cameraNotFound') as string;
    if (camera.error === 'permission_denied') {
      errorMsg = t('cameraPermissionDenied') as string;
    } else if (camera.error === 'secure_context_required') {
      errorMsg = t('cameraSecureContext') as string;
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Scan className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/consent')} className="flex-1">
              {t('back')}
            </Button>
            <Button onClick={() => camera.startCamera()} className="flex-1">
              {language === 'th' ? 'ลองอีกครั้ง' : 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camera view
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {!previewImage && (
        <>
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `${camera.facingMode === 'user' ? 'scaleX(-1)' : ''} rotate(${camera.rotation}deg)`,
            }}
          />

          <FramingOverlay
            mode={MODES[currentStep]}
            rotation={camera.rotation}
            alignmentState={pose.isReady ? validation.state : 'none'}
          />

          <DigitalLevel />

          <AutoCaptureCountdown
            active={autoCountdownActive && quality.canCapture}
            duration={2}
            onComplete={doCapture}
          />

          <CaptureGuide
            currentStep={currentStep}
            mode={MODES[currentStep]}
            brightnessWarning={false}
            poseLoading={pose.isLoading}
            alignmentState={pose.isReady ? validation.state : 'none'}
            poseFeedbackKey={pose.isReady ? validation.feedbackKey : null}
          />

          {/* Quality warnings overlay */}
          <QualityWarnings issues={quality.issues} />

          <CaptureControls
            onCapture={doCapture}
            onFlip={camera.flipCamera}
            onUpload={handleUpload}
            facingMode={camera.facingMode}
            isReady={camera.isReady}
          />
        </>
      )}

      {previewImage && (
        <div className="absolute inset-0 z-50 bg-background overflow-y-auto">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b safe-area-top">
            <button onClick={handleRetake} className="p-2 hover:bg-accent rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <span className="font-semibold text-sm">
              {language === 'th' ? `ปรับแต่งจุด - ${modeLabels[currentStep]}` : `Adjust Points - ${modeLabels[currentStep]}`}
            </span>
            <div className="w-9" /> {/* Spacer */}
          </header>

          <div className="p-4 max-w-lg mx-auto pb-20">
            {currentStep === 0 ? (
              <ScoliosisOverlay
                imageSrc={previewImage}
                landmarks={capturedLandmarks || new Array(33).fill({ x: 0.5, y: 0.5, z: 0 })}
                onConfirm={handleStandingConfirm}
              />
            ) : (
              <AdamTestOverlay
                imageSrc={previewImage}
                onAnalysisReady={handleAdamReady}
              />
            )}
          </div>
        </div>
      )}

      <div className="absolute top-24 right-3 z-20 flex flex-col gap-2">
        {capturedImages.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              if (img) {
                setCurrentStep(i);
                setCapturedImages(prev => { const next = [...prev]; next[i] = null; return next; });
              } else {
                setCurrentStep(i);
              }
            }}
            className={`h-12 w-9 rounded-md border-2 overflow-hidden transition-all ${i === currentStep ? 'border-white scale-110' : 'border-white/40'
              }`}
          >
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <span className="text-white/60 text-[10px] font-bold">{i + 1}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CapturePage;
