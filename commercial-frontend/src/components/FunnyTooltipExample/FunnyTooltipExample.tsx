"use client";

import { useFps } from "@/utils/funny functions/useFps";
import { useLayoutEffect, useRef, useState } from "react";
import { MoveObserver } from "@/utils/funny functions/MoveObserver";

export const FunnyTooltipExample = () => {
  const fps = useFps();
  const divRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!divRef.current) return;
    return MoveObserver(divRef.current, (rect) => {
      setTooltipPosition({ x: rect.left, y: rect.bottom });
    });
  }, []);

  return (
    <div className="w-1/2 min-h-1/2 flex">
      <div
        className="text-[20px] font-bold w-fit h-fit cursor-pointer select-none"
        ref={divRef}
        onClick={() =>
          (tooltipRef.current!.hidden = !tooltipRef.current!.hidden)
        }
      >
        Show fps
      </div>

      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          top: tooltipPosition.y,
          left: tooltipPosition.x,
        }}
      >
        FPS: {fps}
      </div>
    </div>
  );
};
