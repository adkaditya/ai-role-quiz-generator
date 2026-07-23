import { useEffect, useRef } from "react";
import { VIOLATIONS } from "../constants/violationTypes";

const useProctoring = ({
  enabled,
  onViolation,
  isEnteringFullscreenRef,
  isWarningActiveRef,
}) => {
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  });

  useEffect(() => {
    if (!enabled) return;

    const shouldIgnore = () => {
      return !enabled || (isWarningActiveRef && isWarningActiveRef.current);
    };

    // ==========================
    // Fullscreen Exit Detection
    // ==========================
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        isEnteringFullscreenRef.current = false;
        return;
      }

      if (shouldIgnore()) return;
      onViolationRef.current?.(VIOLATIONS.FULLSCREEN);
    };
    // ==========================
    // Tab Switching Detection
    // ==========================
    const handleVisibilityChange = () => {
      if (shouldIgnore()) return;
      if (document.hidden) {
        onViolationRef.current?.(VIOLATIONS.TAB_SWITCH);
      }
    };

    // ==========================
    // Focus Loss Detection
    // ==========================
    const handleBlur = () => {
      if (shouldIgnore()) return;
      onViolationRef.current?.(VIOLATIONS.TAB_SWITCH);
    };

    // ==========================
    // Keyboard Detection
    // ==========================
    const handleKeyDown = (event) => {
      if (shouldIgnore()) return;
      const key = event.key.toLowerCase();
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (key === "escape") {
        onViolationRef.current?.(VIOLATIONS.FULLSCREEN);
        return;
      }

      if (event.key === "F12") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.DEVTOOLS);
        return;
      }

      if (isModifierPressed && event.shiftKey && key === "i") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.DEVTOOLS);
        return;
      }

      if (isModifierPressed && event.shiftKey && key === "j") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.DEVTOOLS);
        return;
      }

      if (isModifierPressed && key === "u") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.DEVTOOLS);
        return;
      }

      if (isModifierPressed && key === "c") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.COPY);
        return;
      }

      if (isModifierPressed && key === "v") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.PASTE);
        return;
      }

      if (isModifierPressed && key === "x") {
        event.preventDefault();
        onViolationRef.current?.(VIOLATIONS.CUT);
        return;
      }
    };

    // ==========================
    // Right Click Detection
    // ==========================
    const handleContextMenu = (event) => {
      if (shouldIgnore()) return;
      event.preventDefault();
      onViolationRef.current?.(VIOLATIONS.RIGHT_CLICK);
    };

    // ==========================
    // Clipboard Action Detection
    // ==========================
    const handleCopy = (event) => {
      if (shouldIgnore()) return;
      event.preventDefault();
      onViolationRef.current?.(VIOLATIONS.COPY);
    };

    const handlePaste = (event) => {
      if (shouldIgnore()) return;
      event.preventDefault();
      onViolationRef.current?.(VIOLATIONS.PASTE);
    };

    const handleCut = (event) => {
      if (shouldIgnore()) return;
      event.preventDefault();
      onViolationRef.current?.(VIOLATIONS.CUT);
    };

    // ==========================
    // DevTools Resize Detection
    // ==========================
    const handleResize = () => {
      if (shouldIgnore()) return;
      if (document.fullscreenElement) {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
          onViolationRef.current?.(VIOLATIONS.DEVTOOLS);
        }
      }
    };

    // ==========================
    // Register Events
    // ==========================
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    window.addEventListener("resize", handleResize);

    // ==========================
    // Cleanup
    // ==========================
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, isEnteringFullscreenRef, isWarningActiveRef]);
};

export default useProctoring;
