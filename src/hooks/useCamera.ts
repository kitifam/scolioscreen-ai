import { useState, useRef, useCallback, useEffect } from 'react';

export type FacingMode = 'user' | 'environment';

interface UseCameraOptions {
  initialFacing?: FacingMode;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isReady: boolean;
  error: string | null;
  facingMode: FacingMode;
  rotation: number;
  availableCameras: MediaDeviceInfo[];
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  flipCamera: () => Promise<void>;
  rotate: () => void;
  captureImage: () => string | null;
}

export function useCamera({ initialFacing }: UseCameraOptions = {}): UseCameraReturn {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const defaultFacing: FacingMode = initialFacing ?? (isMobile ? 'user' : 'environment');
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(defaultFacing);
  const [rotation, setRotation] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Enumerate cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      setAvailableCameras(devices.filter((d) => d.kind === 'videoinput'));
    }).catch(() => { });
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsReady(false);

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('secure_context_required');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic constraints if high-res fails on mobile
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }

      // Re-enumerate after permission granted
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableCameras(devices.filter((d) => d.kind === 'videoinput'));
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('permission_denied');
      } else if (err.name === 'NotFoundError') {
        setError('not_found');
      } else {
        setError('unknown');
      }
    }
  }, [facingMode, stream]);

  const flipCamera = useCallback(async () => {
    const next: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('secure_context_required');
        return;
      }

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: next }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch (err) {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: next } },
          audio: false,
        });
      }
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch {
      setError('not_found');
    }
  }, [facingMode, stream]);

  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const captureImage = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !isReady) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Optimize resolution for AI analysis & fast upload
    const MAX_DIMENSION = 800;
    let targetW = vw;
    let targetH = vh;

    if (Math.max(vw, vh) > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(vw, vh);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    // Determine canvas size based on rotation
    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? targetH : targetW;
    canvas.height = isRotated ? targetW : targetH;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // If front camera, mirror horizontally
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.75);
  }, [isReady, rotation, facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    isReady,
    error,
    facingMode,
    rotation,
    availableCameras,
    startCamera,
    stopCamera,
    flipCamera,
    rotate,
    captureImage,
  };
}
