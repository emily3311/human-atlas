import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { catalogueWidth } from "./catalogue-layout";

export default function CatalogueResizeHandle({
  width,
  onWidth,
}: {
  width: number;
  onWidth: (width: number) => void;
}) {
  const drag = useRef<{ x: number; width: number } | null>(null);
  const [viewportWidth,setViewportWidth]=useState(()=>typeof window === "undefined" ? 1440 : window.innerWidth);
  useEffect(()=>{
    const updateViewport=()=>setViewportWidth(window.innerWidth);
    window.addEventListener("resize",updateViewport);
    return()=>window.removeEventListener("resize",updateViewport);
  },[]);
  const update = (requested: number) => onWidth(catalogueWidth(requested, viewportWidth));
  const finish = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") update(width - 16);
    else if (event.key === "ArrowRight") update(width + 16);
    else if (event.key === "Home") update(260);
    else if (event.key === "End") update(520);
    else return;
    event.preventDefault();
  };

  return (
    <div
      className="catalogue-resize-handle"
      role="separator"
      aria-label="调整目录宽度"
      aria-orientation="vertical"
      aria-valuemin={260}
      aria-valuemax={catalogueWidth(520, viewportWidth)}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        drag.current = { x: event.clientX, width };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
          update(drag.current.width + event.clientX - drag.current.x);
        }
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
