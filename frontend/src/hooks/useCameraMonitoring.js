import { useEffect, useRef, useState } from "react";

const useCameraMonitoring = ({ enabled, onViolation }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraEnabled(true);
      } catch (error) {
        console.error("Camera Error:", error);

        setCameraEnabled(false);

        onViolation?.("Camera Permission Denied");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [enabled, onViolation]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (!streamRef.current) return;

      const videoTrack = streamRef.current
        .getVideoTracks()[0];

      if (!videoTrack || videoTrack.readyState !== "live") {
        onViolation?.("Camera Turned Off");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, onViolation]);

  return {
    videoRef,
    cameraEnabled,
  };
};

export default useCameraMonitoring;