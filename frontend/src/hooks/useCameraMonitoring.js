import { useEffect, useRef, useState } from "react";

const useCameraMonitoring = ({ enabled, onViolation }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Start / Stop Camera
  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setCameraEnabled(false);
      return;
    }

    // Camera already running
    if (streamRef.current) {
      setCameraEnabled(true);
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          try {
            await videoRef.current.play();
          } catch (err) {
            console.warn("Video play failed:", err);
          }
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
        streamRef.current = null;
      }

      setCameraEnabled(false);
    };
  }, [enabled, onViolation]);

  // Monitor Camera Status
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (!streamRef.current) {
        setCameraEnabled(false);
        return;
      }

      const videoTrack = streamRef.current.getVideoTracks()[0];

      if (!videoTrack || videoTrack.readyState !== "live") {
        setCameraEnabled(false);
        onViolation?.("Camera Turned Off");
      } else {
        setCameraEnabled(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, onViolation]);

  return {
    videoRef,
    cameraEnabled,
  };
};

export default useCameraMonitoring;