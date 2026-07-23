import { useCallback, useEffect, useRef, useState } from "react";
import { loadYOLO } from "../ai/yoloLoader.js";
import { detectPhones } from "../ai/yoloDetector.js";

const DETECTION_INTERVAL_MS = 900;
const REQUIRED_CONSECUTIVE_DETECTIONS = 2;
const VIOLATION_COOLDOWN_MS = 8000;

const useCameraMonitoring = ({ enabled, onViolation, activeStreamRef }) => {
  const streamRef = useRef(null);
  const videoNodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const modelLoadedRef = useRef(false);
  const consecutivePhoneFramesRef = useRef(0);
  const lastViolationAtRef = useRef(0);
  const onViolationRef = useRef(onViolation);

  const [cameraEnabled, setCameraEnabled] = useState(false);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        await loadYOLO();
        if (mounted) {
          modelLoadedRef.current = true;
        }
      } catch {
        if (mounted) {
          modelLoadedRef.current = false;
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  const videoRef = useCallback((node) => {
    videoNodeRef.current = node;

    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      consecutivePhoneFramesRef.current = 0;
      setCameraEnabled(false);
      return;
    }

    const startCamera = async () => {
      if (activeStreamRef?.current) {
        streamRef.current = activeStreamRef.current;
        activeStreamRef.current = null;
      }

      if (!streamRef.current) {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          onViolationRef.current?.("Camera Permission Denied");
          return;
        }
      }

      const stream = streamRef.current;
      const track = stream.getVideoTracks()[0];

      if (track) {
        track.onended = () => {
          consecutivePhoneFramesRef.current = 0;
          setCameraEnabled(false);
          onViolationRef.current?.("Camera Turned Off");
        };
      }

      const node = videoNodeRef.current;
      if (node) {
        node.srcObject = stream;
        node.play().catch(() => {});
      }

      setCameraEnabled(true);
    };

    startCamera();
  }, [enabled, activeStreamRef]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(async () => {
      if (isProcessingRef.current || !modelLoadedRef.current) return;

      const stream = streamRef.current;
      if (!stream) {
        consecutivePhoneFramesRef.current = 0;
        setCameraEnabled(false);
        return;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState !== "live") {
        consecutivePhoneFramesRef.current = 0;
        setCameraEnabled(false);
        onViolationRef.current?.("Camera Turned Off");
        return;
      }

      setCameraEnabled(true);

      const node = videoNodeRef.current;
      if (!node) return;

      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }

      if (node.paused) {
        node.play().catch(() => {});
      }

      if (
        node.readyState < 2 ||
        node.videoWidth <= 0 ||
        node.videoHeight <= 0 ||
        node.paused
      ) {
        return;
      }

      isProcessingRef.current = true;
      try {
        const phones = await detectPhones(node);

        if (phones.length > 0) {
          consecutivePhoneFramesRef.current += 1;
        } else {
          consecutivePhoneFramesRef.current = 0;
        }

        const now = Date.now();
        const canReport =
          consecutivePhoneFramesRef.current >= REQUIRED_CONSECUTIVE_DETECTIONS &&
          now - lastViolationAtRef.current >= VIOLATION_COOLDOWN_MS;

        if (canReport) {
          lastViolationAtRef.current = now;
          consecutivePhoneFramesRef.current = 0;
          onViolationRef.current?.("Mobile Phone Detected");
        }
      } catch {
        consecutivePhoneFramesRef.current = 0;
      } finally {
        isProcessingRef.current = false;
      }
    }, DETECTION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    videoRef,
    cameraEnabled,
  };
};

export default useCameraMonitoring;
