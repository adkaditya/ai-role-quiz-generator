import React from "react";

const CameraPreview = ({ videoRef, cameraEnabled }) => {
  return (
    <div className="fixed top-24 right-5 z-50">

      <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
        className="w-44 h-32 object-cover rounded-lg"
        />

        <div
          className={`text-center py-2 text-sm font-semibold ${
            cameraEnabled
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {cameraEnabled
            ? "🟢 Camera Active"
            : "🔴 Camera Disabled"}
        </div>

      </div>

    </div>
  );
};

export default CameraPreview;