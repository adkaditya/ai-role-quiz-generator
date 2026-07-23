import React from "react";

const CameraPreview = React.memo(({ videoRef, cameraEnabled }) => {
  return (
    <div className="fixed top-20 right-3 sm:top-4 sm:right-4 z-50 select-none">
      <div className="w-28 sm:w-36 md:w-44 overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-md transition-all">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full bg-black object-cover"
          />
          <div className="absolute left-1.5 top-1.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                cameraEnabled ? "animate-pulse bg-green-500" : "bg-red-500"
              }`}
            />
            {cameraEnabled ? "LIVE" : "OFF"}
          </div>
        </div>

        <div
          className={`flex items-center justify-center gap-1.5 py-1 text-center text-[10px] font-semibold text-white sm:py-1.5 sm:text-xs ${
            cameraEnabled ? "bg-emerald-600/90" : "bg-rose-600/90"
          }`}
        >
          {cameraEnabled ? "Camera Active" : "Camera Disabled"}
        </div>
      </div>
    </div>
  );
});

CameraPreview.displayName = "CameraPreview";

export default CameraPreview;
