import React, { useEffect, useRef, useState, useCallback } from 'react';
import { type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, RefreshCcw } from 'lucide-react';

export interface StandingMetrics {
  sAngle: number;
  hAngle: number;
  spineDev: number;
  riskScore: number;
  riskLevel: { th: string, en: string };
  landmarks: NormalizedLandmark[]; // Keeping this for backward compatibility if needed
  annotatedImage?: string;
}

interface ScoliosisOverlayProps {
  imageSrc: string;
  landmarks: NormalizedLandmark[];
  onConfirm?: (metrics: StandingMetrics) => void;
  isConfirmed?: boolean;
}

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

const KNOB_COLOR = '#2B2727'; // Dark gray/black per user request
const LINE_COLOR = '#2B2727';

const ScoliosisOverlay: React.FC<ScoliosisOverlayProps> = ({ imageSrc, landmarks, onConfirm, isConfirmed = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language } = useLanguage();
  const lang = language === 'th' ? 'th' : 'en';

  const [localConfirmed, setLocalConfirmed] = useState(isConfirmed);
  const [metrics, setMetrics] = useState({
    shoulderAngle: 0,
    hipAngle: 0,
    spineDev: 0,
    riskScore: 0,
    riskLevel: { th: '', en: '' }
  });

  const [points, setPoints] = useState({
    ls: { x: 0.3, y: 0.4 }, rs: { x: 0.7, y: 0.4 },
    lh: { x: 0.3, y: 0.65 }, rh: { x: 0.7, y: 0.65 },
    st: { x: 0.5, y: 0.4 }, sb: { x: 0.5, y: 0.65 }
  });

  const [draggingPoint, setDraggingPoint] = useState<keyof typeof points | null>(null);

  // Initialize points from MediaPipe landmarks if available
  useEffect(() => {
    if (landmarks && landmarks.length >= 33 && !localConfirmed) {
      // Check if they are dummy points or actual detections
      const isDummy = landmarks[LEFT_SHOULDER].x === 0.5 && landmarks[LEFT_SHOULDER].y === 0.5;
      
      if (!isDummy) {
        setPoints({
          ls: { x: landmarks[LEFT_SHOULDER].x, y: landmarks[LEFT_SHOULDER].y },
          rs: { x: landmarks[RIGHT_SHOULDER].x, y: landmarks[RIGHT_SHOULDER].y },
          lh: { x: landmarks[LEFT_HIP].x, y: landmarks[LEFT_HIP].y },
          rh: { x: landmarks[RIGHT_HIP].x, y: landmarks[RIGHT_HIP].y },
          st: { x: (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2, y: (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2 },
          sb: { x: (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2, y: (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2 }
        });
      } else {
        // Fallback default positions if AI couldn't detect anything
        setPoints({
          ls: { x: 0.3, y: 0.4 }, rs: { x: 0.7, y: 0.4 },
          lh: { x: 0.3, y: 0.65 }, rh: { x: 0.7, y: 0.65 },
          st: { x: 0.5, y: 0.4 }, sb: { x: 0.5, y: 0.65 }
        });
      }
    }
  }, [landmarks, localConfirmed]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 300;
      const scale = containerWidth / img.width;
      canvas.width = containerWidth;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // --- Calculations ---
      const calcHorizontalAngle = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        const dy = (p2.y - p1.y) * canvas.height;
        const dx = (p2.x - p1.x) * canvas.width;
        return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      };

      const shoulderAngle = calcHorizontalAngle(points.ls, points.rs);
      const hipAngle = calcHorizontalAngle(points.lh, points.rh);

      const spineDev = (shoulderAngle * 0.5) + (hipAngle * 0.5);
      let riskScore = 0;
      let riskLevel = { th: 'ปกติ', en: 'Normal' };

      if (spineDev < 10) {
        riskScore = Math.round(spineDev * 1.5);
        riskLevel = { th: 'ปกติ', en: 'Normal' };
      } else if (spineDev < 25) {
        riskScore = 16 + Math.round(((spineDev - 10) / 15) * 24);
        riskLevel = { th: 'น้อย (Mild)', en: 'Mild' };
      } else if (spineDev <= 45) {
        riskScore = 41 + Math.round(((spineDev - 25) / 20) * 29);
        riskLevel = { th: 'ปานกลาง (Moderate)', en: 'Moderate' };
      } else {
        riskScore = 71 + Math.min(Math.round(((spineDev - 45) / 45) * 29), 29);
        riskLevel = { th: 'มาก (Severe)', en: 'Severe' };
      }

      setMetrics({
        shoulderAngle: Math.round(shoulderAngle * 10) / 10,
        hipAngle: Math.round(hipAngle * 10) / 10,
        spineDev,
        riskScore,
        riskLevel
      });

      // --- Drawing ---
      const drawLine = (p1: { x: number, y: number }, p2: { x: number, y: number }, label: string) => {
        const x1 = p1.x * canvas.width;
        const y1 = p1.y * canvas.height;
        const x2 = p2.x * canvas.width;
        const y2 = p2.y * canvas.height;

        // Draw dashed line
        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw endpoints (knobs)
        const drawKnob = (x: number, y: number) => {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = KNOB_COLOR;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        };

        drawKnob(x1, y1);
        drawKnob(x2, y2);

        // Draw Label
        ctx.font = 'bold 14px sans-serif';
        const textMetrics = ctx.measureText(label);
        
        // Background for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x1 - textMetrics.width - 25, y1 - 12, textMetrics.width + 12, 24, 4);
        ctx.fill();

        ctx.fillStyle = LINE_COLOR;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x1 - 18, y1);
      };

      const drawSpineLine = (p1: { x: number, y: number }, p2: { x: number, y: number }, label: string) => {
        const x1 = p1.x * canvas.width;
        const y1 = p1.y * canvas.height;
        const x2 = p2.x * canvas.width;
        const y2 = p2.y * canvas.height;

        // Draw dashed line
        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw endpoints (knobs)
        const drawKnob = (x: number, y: number) => {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = KNOB_COLOR;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        };

        drawKnob(x1, y1);
        drawKnob(x2, y2);

        // Draw Label at midpoint
        ctx.font = 'bold 14px sans-serif';
        const textMetrics = ctx.measureText(label);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Background for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.roundRect(midX - textMetrics.width - 25, midY - 12, textMetrics.width + 12, 24, 4);
        ctx.fill();

        ctx.fillStyle = LINE_COLOR;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX - 18, midY);
      };

      // Draw Shoulder Line
      drawLine(points.ls, points.rs, language === 'th' ? 'ระดับไหล่' : 'Shoulders');
      // Draw Hip Line
      drawLine(points.lh, points.rh, language === 'th' ? 'ระดับเอว' : 'Waist');
      // Draw Spine Line
      drawSpineLine(points.st, points.sb, language === 'th' ? 'กระดูกสันหลัง' : 'Spine');

    };
  }, [imageSrc, points, language]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, points]);

  // --- Interaction Logic ---
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX / canvas.width,
      y: (clientY - rect.top) * scaleY / canvas.height
    };
  };

  const RADIUS_THRESHOLD = 0.08;

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (localConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointer = getCanvasCoords(e, canvas);
    let closestKey: keyof typeof points | null = null;
    let minDistance = Infinity;

    Object.entries(points).forEach(([key, pt]) => {
      const dx = pt.x - pointer.x;
      const dy = pt.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance && dist < RADIUS_THRESHOLD) {
        minDistance = dist;
        closestKey = key as keyof typeof points;
      }
    });

    if (closestKey) {
      setDraggingPoint(closestKey);
      if (e.cancelable) e.preventDefault();
    }
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingPoint || localConfirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pointer = getCanvasCoords(e, canvas);
    setPoints(prev => ({ ...prev, [draggingPoint]: { x: pointer.x, y: pointer.y } }));
  }, [draggingPoint, localConfirmed]);

  const handlePointerUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  useEffect(() => {
    if (draggingPoint) {
      window.addEventListener('mousemove', handlePointerMove, { passive: false });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [draggingPoint, handlePointerMove, handlePointerUp]);

  const handleConfirm = () => {
    setLocalConfirmed(true);
    if (onConfirm) {
      // Reconstruct landmarks array for compatibility if needed downstream
      const finalLandmarks = Array(33).fill({ x: 0.5, y: 0.5, z: 0 });
      finalLandmarks[LEFT_SHOULDER] = { ...finalLandmarks[LEFT_SHOULDER], x: points.ls.x, y: points.ls.y };
      finalLandmarks[RIGHT_SHOULDER] = { ...finalLandmarks[RIGHT_SHOULDER], x: points.rs.x, y: points.rs.y };
      finalLandmarks[LEFT_HIP] = { ...finalLandmarks[LEFT_HIP], x: points.lh.x, y: points.lh.y };
      finalLandmarks[RIGHT_HIP] = { ...finalLandmarks[RIGHT_HIP], x: points.rh.x, y: points.rh.y };

      const canvas = canvasRef.current;
      const annotatedImage = canvas ? canvas.toDataURL('image/jpeg', 0.8) : undefined;

      onConfirm({
        sAngle: metrics.shoulderAngle,
        hAngle: metrics.hipAngle,
        spineDev: metrics.spineDev,
        riskScore: metrics.riskScore,
        riskLevel: metrics.riskLevel,
        landmarks: finalLandmarks,
        annotatedImage
      });
    }
  };

  const handleReset = () => {
    // Force re-initialization from props
    const isDummy = landmarks[LEFT_SHOULDER].x === 0.5 && landmarks[LEFT_SHOULDER].y === 0.5;
    if (!isDummy) {
      setPoints({
        ls: { x: landmarks[LEFT_SHOULDER].x, y: landmarks[LEFT_SHOULDER].y },
        rs: { x: landmarks[RIGHT_SHOULDER].x, y: landmarks[RIGHT_SHOULDER].y },
        lh: { x: landmarks[LEFT_HIP].x, y: landmarks[LEFT_HIP].y },
        rh: { x: landmarks[RIGHT_HIP].x, y: landmarks[RIGHT_HIP].y },
        st: { x: (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2, y: (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2 },
        sb: { x: (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2, y: (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2 }
      });
    } else {
      setPoints({
        ls: { x: 0.3, y: 0.4 }, rs: { x: 0.7, y: 0.4 },
        lh: { x: 0.3, y: 0.65 }, rh: { x: 0.7, y: 0.65 },
        st: { x: 0.5, y: 0.4 }, sb: { x: 0.5, y: 0.65 }
      });
    }
    setLocalConfirmed(false);
  };

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg text-center font-medium shadow-sm border ${localConfirmed
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
        {localConfirmed
          ? (language === 'th' ? '✅ ยืนยันจุดเรียบร้อย' : '✅ Points confirmed')
          : (language === 'th' ? '👆 จับขยับปลายเส้นประ ให้ตรงกับระดับไหล่และเอว' : '👆 Drag the ends of the dashed lines to match shoulder and waist levels')
        }
      </div>

      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black/5">
        <canvas
          ref={canvasRef}
          className={`w-full block ${localConfirmed ? 'cursor-default' : 'cursor-grab active:cursor-grabbing touch-none'}`}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent/20 p-3 rounded-xl border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {language === 'th' ? 'ระดับไหล่' : 'Shoulder Angle'}
          </p>
          <div className="flex items-end gap-2">
            <span className={`text-xl font-bold ${metrics.shoulderAngle >= 10 ? 'text-destructive' : 'text-green-500'}`}>
              {metrics.shoulderAngle}°
            </span>
            <span className="text-[10px] mb-1 text-muted-foreground">
              ({metrics.shoulderAngle >= 10 ? (language === 'th' ? 'ผิดปกติ' : 'Abnormal') : (language === 'th' ? 'ปกติ' : 'Normal')})
            </span>
          </div>
        </div>
        <div className="bg-accent/20 p-3 rounded-xl border border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {language === 'th' ? 'ระดับเอว' : 'Waist Angle'}
          </p>
          <div className="flex items-end gap-2">
            <span className={`text-xl font-bold ${metrics.hipAngle >= 10 ? 'text-destructive' : 'text-green-500'}`}>
              {metrics.hipAngle}°
            </span>
            <span className="text-[10px] mb-1 text-muted-foreground">
              ({metrics.hipAngle >= 10 ? (language === 'th' ? 'ผิดปกติ' : 'Abnormal') : (language === 'th' ? 'ปกติ' : 'Normal')})
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReset}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {language === 'th' ? 'คืนค่าเริ่มต้น' : 'Reset'}
        </Button>

        <Button
          variant="default"
          className="flex-1"
          onClick={handleConfirm}
          disabled={localConfirmed}
        >
          <Check className="w-4 h-4 mr-2" />
          {language === 'th' ? 'ยืนยัน' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
};

export default ScoliosisOverlay;
