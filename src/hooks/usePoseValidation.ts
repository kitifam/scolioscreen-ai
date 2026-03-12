import { useMemo } from 'react';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { OverlayMode } from '@/components/FramingOverlay';

export type AlignmentState = 'none' | 'partial' | 'aligned';

interface PoseValidationResult {
  state: AlignmentState;
  feedbackKey: string | null; // translation key
}

// MediaPipe landmark indices
const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_KNEE = 25;
const RIGHT_KNEE = 26;
const LEFT_ANKLE = 27;
const RIGHT_ANKLE = 28;

const FRAME_MARGIN = 0.08; // 8% from edges

function inFrame(lm: NormalizedLandmark): boolean {
  return lm.x > FRAME_MARGIN && lm.x < (1 - FRAME_MARGIN) && lm.y > 0.03 && lm.y < 0.97;
}

function isVisible(lm: NormalizedLandmark, threshold = 0.5): boolean {
  return (lm.visibility ?? 0) > threshold;
}

function shouldersLevel(landmarks: NormalizedLandmark[]): boolean {
  const diff = Math.abs(landmarks[LEFT_SHOULDER].y - landmarks[RIGHT_SHOULDER].y);
  return diff < 0.08;
}

export function usePoseValidation(
  landmarks: NormalizedLandmark[] | null,
  mode: OverlayMode
): PoseValidationResult {
  return useMemo(() => {
    if (!landmarks || landmarks.length < 29) {
      return { state: 'none', feedbackKey: 'poseFeedbackNoBody' };
    }

    const nose = landmarks[NOSE];
    const lShoulder = landmarks[LEFT_SHOULDER];
    const rShoulder = landmarks[RIGHT_SHOULDER];
    const lHip = landmarks[LEFT_HIP];
    const rHip = landmarks[RIGHT_HIP];
    const lKnee = landmarks[LEFT_KNEE];
    const rKnee = landmarks[RIGHT_KNEE];
    const lAnkle = landmarks[LEFT_ANKLE];
    const rAnkle = landmarks[RIGHT_ANKLE];

    if (mode === 'upperBody') {
      // Need: nose, shoulders, hips visible and in frame
      const requiredVisible = [nose, lShoulder, rShoulder, lHip, rHip];
      const allVisible = requiredVisible.every(lm => isVisible(lm, 0.4));
      if (!allVisible) return { state: 'none', feedbackKey: 'poseFeedbackNoBody' };

      const allInFrame = requiredVisible.every(inFrame);
      if (!allInFrame) return { state: 'partial', feedbackKey: 'poseFeedbackAdjustPosition' };

      if (!shouldersLevel(landmarks)) return { state: 'partial', feedbackKey: 'poseFeedbackStandStraight' };

      return { state: 'aligned', feedbackKey: 'poseFeedbackReady' };
    }

    if (mode === 'lowerBody') {
      // For Adam Test (lowerBody), we primarily need hips and shoulders to be visible.
      // Hips should be in frame.
      const requiredHips = [lHip, rHip];
      const hipsVisible = requiredHips.every(lm => isVisible(lm, 0.2));
      if (!hipsVisible) return { state: 'none', feedbackKey: 'poseFeedbackNoBody' };

      const hipsInFrame = requiredHips.every(inFrame);
      if (!hipsInFrame) return { state: 'partial', feedbackKey: 'poseFeedbackAdjustPosition' };

      // Check if bending: shoulders should be lower than usual, close to hip level in Y
      const avgHipY = (lHip.y + rHip.y) / 2;
      const avgShoulderY = (lShoulder.y + rShoulder.y) / 2;
      
      // If shoulders are significantly lower or close to hip level, it's a bend
      const isBending = (avgShoulderY > avgHipY - 0.1); 
      
      if (!isBending) return { state: 'partial', feedbackKey: 'qualityBodyTwist' }; // Reuse 'twist' as 'bend more' hint or similar

      return { state: 'aligned', feedbackKey: 'poseFeedbackReady' };
    }

    // fullBody fallback (shouldn't be used but safe)
    return { state: 'none', feedbackKey: null };
  }, [landmarks, mode]);
}
