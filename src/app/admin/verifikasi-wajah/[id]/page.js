"use client";

import { useState, useEffect, useRef, use } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Success Modal Component
function SuccessModal({ isOpen, countdown }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Berhasil Diverifikasi
          </h3>
          <p className="text-gray-600 mb-4">Silakan masuk ke ruang ujian.</p>
          <div className="text-brand-blue text-xl font-semibold">
            {countdown}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifikasiWajahCamera({ params }) {
  const { id } = use(params);
  const videoRef = useRef(null);
  const [verificationState, setVerificationState] = useState("waiting"); // waiting, scanning, success, modal
  const [modalCountdown, setModalCountdown] = useState(3);
  const [statusMessage, setStatusMessage] = useState("Harap melangkah ke depan kamera");

  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let timer;

    if (verificationState === "waiting") {
      // Wait 5 seconds, then start scanning
      timer = setTimeout(() => {
        setVerificationState("scanning");
        setStatusMessage("Jangan bergerak. Harap tunggu sebentar");
      }, 5000);
    } else if (verificationState === "scanning") {
      // Scan for 2-3 seconds, then show success
      timer = setTimeout(() => {
        setVerificationState("success");
      }, 2500);
    } else if (verificationState === "success") {
      // Show green border briefly, then open modal
      timer = setTimeout(() => {
        setVerificationState("modal");
        setModalCountdown(3);
      }, 500);
    } else if (verificationState === "modal") {
      // Countdown in modal
      if (modalCountdown > 0) {
        timer = setTimeout(() => {
          setModalCountdown(modalCountdown - 1);
        }, 1000);
      } else {
        // Reset cycle
        setVerificationState("waiting");
        setStatusMessage("Harap melangkah ke depan kamera");
      }
    }

    return () => clearTimeout(timer);
  }, [verificationState, modalCountdown]);

  // Determine border color based on state
  const getBorderColor = () => {
    switch (verificationState) {
      case "waiting":
        return "border-red-500";
      case "scanning":
        return "border-blue-500";
      case "success":
      case "modal":
        return "border-green-500";
      default:
        return "border-red-500";
    }
  };

  // Determine status text color
  const getTextColor = () => {
    switch (verificationState) {
      case "waiting":
        return "text-gray-700";
      case "scanning":
        return "text-blue-600";
      case "success":
      case "modal":
        return "text-green-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4 pt-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-pink transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {verificationState === "waiting" || verificationState === "scanning"
              ? statusMessage
              : "Harap melangkah ke depan kamera"}
          </h1>
          {verificationState === "waiting" && (
            <p className="text-lg text-gray-600">
              Pastikan wajah Anda menghadap lurus ke kamera
            </p>
          )}
          {verificationState === "scanning" && (
            <p className={`text-lg font-semibold ${getTextColor()}`}>
              Jangan bergerak. Harap tunggu sebentar
            </p>
          )}
        </div>

        {/* Camera Feed */}
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className={`border-8 ${getBorderColor()} transition-colors duration-300`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 left-4 right-4 flex justify-center">
            <div
              className={`${
                verificationState === "waiting"
                  ? "bg-red-500"
                  : verificationState === "scanning"
                  ? "bg-blue-500"
                  : "bg-green-500"
              } text-white px-6 py-2 rounded-full font-semibold shadow-lg transition-colors duration-300`}
            >
              {verificationState === "waiting" && "Menunggu"}
              {verificationState === "scanning" && "Memindai..."}
              {(verificationState === "success" || verificationState === "modal") && "Berhasil"}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            Sesi verifikasi: Jadwal #{id}
          </p>
        </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={verificationState === "modal"}
        countdown={modalCountdown}
      />
    </div>
  );
}
