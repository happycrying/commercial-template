"use client";
import { useLayoutEffect, useRef, useState } from "react";

export function useFps() {
  const [fps, setFps] = useState<number>(0);
  const currentFrames = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());

  useLayoutEffect(() => {
    let rafId: number;

    const calculateFps = (currentTime: number) => {
      currentFrames.current += 1;
      const delta = (currentTime - lastTime.current) / 1000;

      if (delta >= 1) {
        setFps(Math.ceil(currentFrames.current));
        currentFrames.current = 0;
        lastTime.current = performance.now();
      }

      rafId = requestAnimationFrame(calculateFps);
    };

    rafId = requestAnimationFrame(calculateFps);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}
