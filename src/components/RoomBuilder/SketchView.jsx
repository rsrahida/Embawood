import { useEffect, useRef } from "react";
import { drawSketch } from "./sketch";
import pro from "./RoomBuilderPro.module.css";

const SketchView = ({ data, labels }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    drawSketch(ref.current, data, labels, ratio);
  }, [data, labels]);
  return (
    <div className={pro.sketchCard}>
      <canvas ref={ref} className={pro.sketchCanvas} />
    </div>
  );
};

export default SketchView;
