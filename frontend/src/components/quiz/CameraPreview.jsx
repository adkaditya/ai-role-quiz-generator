const CameraPreview = ({ videoRef, cameraEnabled }) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black rounded-lg overflow-hidden shadow-lg border w-52">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-40 object-cover"
        />

        <div
          className={`text-center text-sm py-2 ${
            cameraEnabled
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {cameraEnabled ? "Camera Active" : "Camera Disabled"}
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;