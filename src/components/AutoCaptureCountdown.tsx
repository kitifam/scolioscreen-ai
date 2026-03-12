import { useEffect, useState, useRef } from 'react';

interface AutoCaptureCountdownProps {
  active: boolean;
  duration?: number;
  onComplete: () => void;
}

const AutoCaptureCountdown = ({ active, duration = 2, onComplete }: AutoCaptureCountdownProps) => {
  const [count, setCount] = useState(duration);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setCount(duration);
      return;
    }

    setCount(duration);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, duration]);

  if (!active || count <= 0) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-30" 
          style={{ width: 140, height: 140, margin: 'auto', top: 0, left: 0, right: 0, bottom: 0 }} />
        <div className="w-[140px] h-[140px] rounded-full bg-green-500/30 backdrop-blur-md flex items-center justify-center border-2 border-green-400">
          <span className="text-white text-6xl font-bold drop-shadow-lg">{count}</span>
        </div>
      </div>
    </div>
  );
};

export default AutoCaptureCountdown;
