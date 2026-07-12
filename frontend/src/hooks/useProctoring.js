import { useEffect } from "react";
import { VIOLATIONS } from "../constants/violationTypes";

const useProctoring = ({ enabled, onViolation }) => {
  const handleKeyDown = (event) => {

    const key = event.key.toLowerCase();

    const isModifierPressed = event.ctrlKey || event.metaKey;

    // ==========================
    // DevTools Detection
    // ==========================

    // F12
    if (event.key === "F12") {
      event.preventDefault();
      onViolation?.(VIOLATIONS.DEVTOOLS);
      return;
    }

    // Ctrl + Shift + I
    if (
      isModifierPressed &&
      event.shiftKey &&
      key === "i"
    ) {
      event.preventDefault();
      onViolation?.(VIOLATIONS.DEVTOOLS);
      return;
    }

    // Ctrl + Shift + J
    if (
      isModifierPressed &&
      event.shiftKey &&
      key === "j"
    ) {
      event.preventDefault();
      onViolation?.(VIOLATIONS.DEVTOOLS);
      return;
    }

    // Ctrl + U
    if (
      isModifierPressed &&
      key === "u"
    ) {
      event.preventDefault();
      onViolation?.(VIOLATIONS.DEVTOOLS);
      return;
    }

    // ==========================
    // Copy
    // ==========================

    if (isModifierPressed && key === "c") {
      event.preventDefault();
      onViolation?.(VIOLATIONS.COPY);
      return;
    }

    // Paste
    if (isModifierPressed && key === "v") {
      event.preventDefault();
      onViolation?.(VIOLATIONS.PASTE);
      return;
    }

    // Cut
    if (isModifierPressed && key === "x") {
      event.preventDefault();
      onViolation?.(VIOLATIONS.CUT);
      return;
    }

};
  // Right Click Detection
// ======================================
const handleContextMenu = (event) => {
  event.preventDefault();
  if (onViolation) {
    onViolation(VIOLATIONS.RIGHT_CLICK);
  }
};
    // ======================================
    // Register Browser Events
    // ======================================
    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    // ======================================
    // Cleanup
    // ======================================
    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
   [enabled, onViolation];
};

export default useProctoring;