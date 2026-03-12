import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Check } from 'lucide-react';

export interface AdamMetrics {
  angle: number;
  level: { th: string; en: string };
  isAbnormal: boolean;
  leftPoint: { x: number; y: number } | null;
  rightPoint: { x: number; y: number } | null;
}

interface AdamTestOverlayProps {
  imageSrc: string;
  onAnalysisReady?: (data: { angle: number; level: { th: string; en: string }; isAbnormal: boolean }) => void;
}

const KNOB_COLOR = '#2B2727';
const LINE_COLOR = '#2B2727';

const AdamTestOverlay: React.FC<AdamTestOverlayProps> = ({ imageSrc, onAnalysisReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language } = useLanguage();
  const lang = language === 'th' ? 'th' : 'en';

  const [localConfirmed, setLocalConfirmed] = useState(false);
  const [points, setPoints] = useState({
    left: { x: 0.2, y: 0.35 },
    right: { x: 0.8, y: 0.35 }
  });
  
  const [draggingPoint, setDraggingPoint] = useState<'left' | 'right' | null>(null);

  const [metrics, setMetrics] = useState<AdamMetrics>({
    angle: 0,
    isAbnormal: false,
    level: { th: 'ปกติ', en: 'Normal' },
    leftPoint: null,
    rightPoint: null
  });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Restore proper scale
      const containerWidth = canvas.parentElement?.clientWidth || 300;
      const scale = containerWidth / img.width;
      canvas.width = containerWidth;
      canvas.height = img.height * scale;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const p1 = points.left;
      const p2 = points.right;

      // Ensure proper left/right mapping visually
      const leftPoint = p1.x < p2.x ? p1 : p2;
      const rightPoint = p1.x < p2.x ? p2 : p1;

      const dy = (rightPoint.y - leftPoint.y) * canvas.height;
      const dx = (rightPoint.x - leftPoint.x) * canvas.width;
      const angle = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      const roundedAngle = Math.round(angle * 10) / 10;

      const isAbnormal = roundedAngle >= 10;
      let level = { th: 'ปกติ', en: 'Normal' };
      if (roundedAngle < 10) level = { th: 'ปกติ', en: 'Normal' };
      else if (roundedAngle <= 25) level = { th: 'น้อย (Mild)', en: 'Mild' };
      else if (roundedAngle <= 40) level = { th: 'ปานกลาง (Moderate)', en: 'Moderate' };
      else level = { th: 'มาก (Severe)', en: 'Severe' };

      // Update metrics
      setMetrics({
        angle: roundedAngle,
        isAbnormal,
        level,
        leftPoint,
        rightPoint
      });

      const x1 = leftPoint.x * canvas.width;
      const y1 = leftPoint.y * canvas.height;
      const x2 = rightPoint.x * canvas.width;
      const y2 = rightPoint.y * canvas.height;

      // Draw horizontal dashed reference line passing through the higher peak (smaller Y)
      const higherScreenPoint = leftPoint.y < rightPoint.y ? leftPoint : rightPoint;
      const higherY = higherScreenPoint.y * canvas.height;

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, higherY);
      ctx.lineTo(canvas.width, higherY);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw connecting dashed line
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

      // Label "กระดูกหลัง" (Back Bone)
      const label = language === 'th' ? 'กระดูกหลัง' : 'Back Level';
      ctx.font = 'bold 16px sans-serif';
      const textMetrics = ctx.measureText(label);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.roundRect(midX - (textMetrics.width / 2) - 10, midY - 30, textMetrics.width + 20, 24, 4);
      ctx.fill();

      ctx.fillStyle = LINE_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, midX, midY - 18);
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
    let closestKey: 'left' | 'right' | null = null;
    let minDistance = Infinity;

    Object.entries(points).forEach(([key, pt]) => {
      const dx = pt.x - pointer.x;
      const dy = pt.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance && dist < RADIUS_THRESHOLD) {
        minDistance = dist;
        closestKey = key as 'left' | 'right';
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

  const handleReset = () => {
    setPoints({ left: { x: 0.2, y: 0.35 }, right: { x: 0.8, y: 0.35 } });
    setLocalConfirmed(false);
  };

  const handleConfirm = () => {
    setLocalConfirmed(true);
    if (onAnalysisReady) {
      onAnalysisReady({
        angle: metrics.angle,
        level: metrics.level,
        isAbnormal: metrics.isAbnormal
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg text-center font-medium shadow-sm border ${localConfirmed
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
        {localConfirmed
          ? (language === 'th' ? '✅ ยืนยันจุดเรียบร้อย' : '✅ Points selected')
          : (language === 'th' ? '👆 จับขยับปลายเส้นประ ให้ขนานกับความนูนสูงสุดของหลัง' : '👆 Drag the ends of the dashed line to match the back contour')
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

      <div className="bg-accent/20 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-border/30">
          <span className="text-sm font-semibold text-muted-foreground">
            {language === 'th' ? 'ค่าองศาที่วัดได้:' : 'Measured Angle:'}
          </span>
          <span className={`text-xl font-bold ${metrics.isAbnormal ? 'text-destructive' : 'text-green-500'}`}>
            {metrics.angle}°
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {language === 'th' ? 'ระดับความรุนแรง:' : 'Severity Level:'}
          </span>
          <span className="font-semibold">
            <span className="flex items-center gap-1.5">
              {metrics.angle < 10 && '✅'}
              {metrics.angle >= 10 && metrics.angle <= 25 && '🟡'}
              {metrics.angle > 25 && metrics.angle <= 40 && '🟠'}
              {metrics.angle > 40 && '🔴'}
              {metrics.level[lang]}
            </span>
          </span>
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
          {language === 'th' ? 'ส่งวิเคราะห์ผล' : 'Analyze'}
        </Button>
      </div>
    </div>
  );
};

export default AdamTestOverlay;
