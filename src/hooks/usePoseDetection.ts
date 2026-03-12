import { useState, useRef, useCallback, useEffect } from 'react';
import { PoseLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface PoseDetectionResult {
  landmarks: NormalizedLandmark[] | null;
  poseCount: number;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  detectFromImage: (image: HTMLImageElement) => Promise<NormalizedLandmark[] | null>;
}

export function usePoseDetection(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean): PoseDetectionResult {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [poseCount, setPoseCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const init = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 3,
        });
        if (cancelled) return;

        landmarkerRef.current = landmarker;
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('Pose detection init error:', err);
          setError('pose_model_failed');
          setIsLoading(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  // Detection loop
  useEffect(() => {
    if (!isReady || !enabled) return;

    const detect = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      // Run at ~4fps to save resources
      if (now - lastTimeRef.current < 250) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTimeRef.current = now;

      try {
        const result = landmarker.detectForVideo(video, now);
        setPoseCount(result.landmarks ? result.landmarks.length : 0);
        if (result.landmarks && result.landmarks.length > 0) {
          setLandmarks(result.landmarks[0]);
        } else {
          setLandmarks(null);
        }
      } catch {
        // Silently skip frame errors
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady, enabled, videoRef]);

  const detectFromImage = useCallback(async (image: HTMLImageElement): Promise<NormalizedLandmark[] | null> => {
    const landmarker = landmarkerRef.current;
    if (!landmarker) return null;

    try {
      const result = landmarker.detect(image);
      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0];
      }
    } catch (err) {
      console.error('Detection from image failed:', err);
    }
    return null;
  }, []);

  return { landmarks, poseCount, isLoading, isReady, error, detectFromImage };
}
