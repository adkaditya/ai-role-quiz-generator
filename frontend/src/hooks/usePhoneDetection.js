import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";


const usePhoneDetection = ({
  videoRef,
  enabled = false,
  onPhoneDetected,
}) => {
  const modelRef = useRef(null);
  const intervalRef = useRef(null);

  const [modelLoaded, setModelLoaded] = useState(false);

  // Load model only once
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await cocoSsd.load();
        modelRef.current = model;
        setModelLoaded(true);

        console.log("✅ COCO SSD Loaded");
      } catch (err) {
        console.error(err);
      }
    };

    loadModel();
  }, []);

  // Detection Loop
  useEffect(() => {
    if (
      !enabled ||
      !modelLoaded ||
      !videoRef.current
    )
      return;

    intervalRef.current = setInterval(async () => {
      const predictions =
        await modelRef.current.detect(
          videoRef.current
        );

      const hasPhone = predictions.some(
        (item) =>
          item.class === "cell phone" &&
          item.score > 0.60
      );

      if (hasPhone) {
        console.log("📱 Phone Detected");

        onPhoneDetected?.();
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [
    enabled,
    modelLoaded,
    onPhoneDetected,
    videoRef,
  ]);

  return {
    modelLoaded,
  };
};

export default usePhoneDetection;