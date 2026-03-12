import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientationState {
  alpha: number | null; // z-axis (0-360)
  beta: number | null;  // x-axis (-180 to 180) — front/back tilt
  gamma: number | null; // y-axis (-90 to 90) — left/right tilt
  isSupported: boolean;
  isLevel: boolean;
}

const LEVEL_THRESHOLD = 5; // degrees

export function useDeviceOrientation(): DeviceOrientationState {
  const [state, setState] = useState<DeviceOrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    isSupported: false,
    isLevel: true,
  });

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta = e.beta ?? 0;
    const gamma = e.gamma ?? 0;
    // Device is "level" when held upright (beta ~90) and not tilted sideways (gamma ~0)
    const isLevel = Math.abs(gamma) < LEVEL_THRESHOLD;
    setState({
      alpha: e.alpha,
      beta,
      gamma,
      isSupported: true,
      isLevel,
    });
  }, []);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') return;

    // iOS 13+ requires permission
    const requestPermission = (DeviceOrientationEvent as any).requestPermission;
    if (typeof requestPermission === 'function') {
      requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setState(s => ({ ...s, isSupported: true }));
        }
      }).catch(() => {});
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      // We'll know it's supported once we get the first event
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  return state;
}
