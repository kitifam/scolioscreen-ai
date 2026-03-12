import { useState, useEffect, useCallback, useRef } from 'react';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { OverlayMode } from '@/components/FramingOverlay';
import { useDeviceOrientation } from './useDeviceOrientation';

export interface QualityIssue {
  id: string;
  severity: 'error' | 'warning';
  messageKey: string;
}

interface UseQualityChecksOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: NormalizedLandmark[] | null;
  mode: OverlayMode;
  cameraReady: boolean;
  enabled: boolean;
}

const BRIGHTNESS_LOW = 35;
const BRIGHTNESS_HIGH = 240;
const TILT_THRESHOLD = 8; // degrees
const SHARPNESS_THRESHOLD = 15;

function analyzeBrightness(video: HTMLVideoElement): { avg: number; backlit: boolean } {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { avg: 128, backlit: false };
    ctx.drawImage(video, 0, 0, 64, 48);
    const data = ctx.getImageData(0, 0, 64, 48).data;

    let sum = 0;
    let centerSum = 0;
    let edgeSum = 0;
    let centerCount = 0;
    let edgeCount = 0;

    for (let y = 0; y < 48; y++) {
      for (let x = 0; x < 64; x++) {
        const i = (y * 64 + x) * 4;
        const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        sum += lum;

        // Center region (middle 50%)
        if (x > 16 && x < 48 && y > 12 && y < 36) {
          centerSum += lum;
          centerCount++;
        } else {
          edgeSum += lum;
          edgeCount++;
        }
      }
    }

    const avg = sum / (64 * 48);
    const centerAvg = centerCount > 0 ? centerSum / centerCount : avg;
    const edgeAvg = edgeCount > 0 ? edgeSum / edgeCount : avg;
    // Backlit: edges much brighter than center
    const backlit = edgeAvg - centerAvg > 60;

    return { avg, backlit };
  } catch {
    return { avg: 128, backlit: false };
  }
}

function analyzeSharpness(video: HTMLVideoElement): number {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 100;
    ctx.drawImage(video, 0, 0, 64, 48);
    const data = ctx.getImageData(0, 0, 64, 48).data;

    // Laplacian variance as sharpness measure
    let variance = 0;
    let count = 0;
    for (let y = 1; y < 47; y++) {
      for (let x = 1; x < 63; x++) {
        const idx = (y * 64 + x) * 4;
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const top = (data[((y - 1) * 64 + x) * 4] + data[((y - 1) * 64 + x) * 4 + 1] + data[((y - 1) * 64 + x) * 4 + 2]) / 3;
        const bottom = (data[((y + 1) * 64 + x) * 4] + data[((y + 1) * 64 + x) * 4 + 1] + data[((y + 1) * 64 + x) * 4 + 2]) / 3;
        const left = (data[(y * 64 + x - 1) * 4] + data[(y * 64 + x - 1) * 4 + 1] + data[(y * 64 + x - 1) * 4 + 2]) / 3;
        const right = (data[(y * 64 + x + 1) * 4] + data[(y * 64 + x + 1) * 4 + 1] + data[(y * 64 + x + 1) * 4 + 2]) / 3;
        const lap = Math.abs(top + bottom + left + right - 4 * center);
        variance += lap;
        count++;
      }
    }
    return count > 0 ? variance / count : 100;
  } catch {
    return 100;
  }
}

function checkMultiplePeople(landmarks: NormalizedLandmark[] | null, allPoseCount: number): boolean {
  return allPoseCount > 1;
}

function checkBodyTwist(landmarks: NormalizedLandmark[]): boolean {
  // Check if shoulders differ significantly in depth (z)
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  if (!lShoulder || !rShoulder) return false;
  const zDiff = Math.abs((lShoulder.z ?? 0) - (rShoulder.z ?? 0));
  return zDiff > 0.15; // significant twist
}

function checkObstruction(landmarks: NormalizedLandmark[], mode: OverlayMode): boolean {
  // Check if key landmarks have very low visibility (something blocking)
  const keyIndices = mode === 'upperBody' ? [0, 11, 12, 23, 24] : [23, 24, 25, 26, 27, 28];
  const lowVis = keyIndices.filter(i => landmarks[i] && (landmarks[i].visibility ?? 0) < 0.3);
  return lowVis.length >= 2; // 2+ key points barely visible = obstruction
}

export function useQualityChecks({ videoRef, landmarks, mode, cameraReady, enabled }: UseQualityChecksOptions) {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [poseCount, setPoseCount] = useState(1);
  const orientation = useDeviceOrientation();
  const intervalRef = useRef<number>(0);

  // Expose method to set pose count from detection hook
  const updatePoseCount = useCallback((count: number) => {
    setPoseCount(count);
  }, []);

  useEffect(() => {
    if (!enabled || !cameraReady) {
      setIssues([]);
      return;
    }

    const check = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const newIssues: QualityIssue[] = [];

      // 1. Brightness
      const { avg, backlit } = analyzeBrightness(video);
      if (avg < BRIGHTNESS_LOW) {
        newIssues.push({ id: 'dark', severity: 'error', messageKey: 'qualityTooDark' });
      } else if (avg > BRIGHTNESS_HIGH) {
        newIssues.push({ id: 'bright', severity: 'warning', messageKey: 'qualityTooBright' });
      }
      if (backlit) {
        newIssues.push({ id: 'backlit', severity: 'warning', messageKey: 'qualityBacklit' });
      }

      // 2. Camera tilt (IMU)
      if (orientation.isSupported && orientation.gamma !== null) {
        if (Math.abs(orientation.gamma) > TILT_THRESHOLD) {
          newIssues.push({ id: 'tilt', severity: 'warning', messageKey: 'qualityTilted' });
        }
      }

      // 3. Sharpness / shake
      const sharpness = analyzeSharpness(video);
      if (sharpness < SHARPNESS_THRESHOLD) {
        newIssues.push({ id: 'blur', severity: 'warning', messageKey: 'qualityBlurry' });
      }

      // 4. Multiple people
      if (poseCount > 1) {
        newIssues.push({ id: 'multi', severity: 'error', messageKey: 'qualityMultiplePeople' });
      }

      // Landmark-based checks
      if (landmarks && landmarks.length >= 29) {
        // 5. Body twist
        if (checkBodyTwist(landmarks)) {
          newIssues.push({ id: 'twist', severity: 'warning', messageKey: 'qualityBodyTwist' });
        }

        // 6. Obstruction
        if (checkObstruction(landmarks, mode)) {
          newIssues.push({ id: 'obstruct', severity: 'warning', messageKey: 'qualityObstruction' });
        }
      }

      setIssues(newIssues);
    };

    // Run every 500ms
    check();
    intervalRef.current = window.setInterval(check, 500);
    return () => window.clearInterval(intervalRef.current);
  }, [enabled, cameraReady, videoRef, landmarks, mode, orientation, poseCount]);

  const hasErrors = issues.some(i => i.severity === 'error');
  const canCapture = !hasErrors;

  return { issues, canCapture, updatePoseCount };
}
