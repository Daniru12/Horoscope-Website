"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentUploadProps {
  requestId: string;
}

export default function PaymentUpload({ requestId }: PaymentUploadProps) {
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("paymentReceipt", file);
    formData.append("requestId", requestId);

    try {
      const res = await fetch("/api/upload-payment-action", {
        method: "POST",
        body: formData,
      });
      // The API responds with a redirect to /profile?success=payment_uploaded
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error("රිසිට්පත උඩුගත කිරීම අසාර්ථක විය. (Upload failed)");
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("කැමරාව ක්‍රියාත්මක කිරීමට නොහැකි විය. කරුණාකර අවසර පරීක්ෂා කරන්න.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `payment_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            stopCamera();
            uploadFile(capturedFile);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gold-400 bg-space-800 p-3 rounded-xl border border-space-700 w-full justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">උඩුගත කරමින්... (Uploading...)</span>
      </div>
    );
  }

  if (isCameraActive) {
    return (
      <div className="w-full bg-space-950 p-4 rounded-2xl border border-space-700 flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-xl border border-space-600 mb-4 bg-black" />
        <div className="flex gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={capturePhoto}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-lg"
          >
            ඡායාරූපය ගන්න (Capture)
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="flex-1 bg-red-650 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-lg"
          >
            නවතන්න (Cancel)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mx-auto">
      <label className="cursor-pointer bg-space-800 hover:bg-space-700 border border-space-600 hover:border-gold-500/50 w-full flex-1 py-3 px-2 rounded-xl text-sm text-white font-bold transition-all flex items-center justify-center gap-2 text-center shadow-lg group">
        <Upload className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform shrink-0" />
        <span className="truncate">ගොනුව (File/PDF)</span>
        <input 
          type="file" 
          name="paymentReceipt" 
          accept="image/*,application/pdf" 
          className="hidden" 
          onChange={handleFileSelect} 
        />
      </label>
      
      <div className="flex items-center justify-center w-full sm:w-auto opacity-60">
        <div className="h-px bg-space-600 flex-1 sm:hidden"></div>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mx-2">හෝ (OR)</span>
        <div className="h-px bg-space-600 flex-1 sm:hidden"></div>
      </div>

      <button
        type="button"
        onClick={startCamera}
        className="cursor-pointer bg-space-800 hover:bg-space-700 border border-space-600 hover:border-gold-500/50 w-full flex-1 py-3 px-2 rounded-xl text-sm text-white font-bold transition-all flex items-center justify-center gap-2 text-center shadow-lg group"
      >
        <Camera className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform shrink-0" />
        <span className="truncate">කැමරාව (Camera)</span>
      </button>
    </div>
  );
}
