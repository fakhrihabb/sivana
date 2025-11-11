"use client";

import { useState, useEffect, useRef, use } from "react";
import { ArrowLeft, Camera, User, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

// Countdown Overlay Component
function CountdownOverlay({ countdown }) {
  if (countdown === null) return null;

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="text-center">
        <div className="text-9xl font-bold text-white mb-4 animate-pulse">
          {countdown}
        </div>
        <p className="text-xl text-white">Tetap tahan posisi Anda...</p>
      </div>
    </div>
  );
}

// Result Modal Component
function ResultModal({ result, onClose }) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          {result.matched ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-24 h-24 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Cocok!
              </h3>
              <p className="text-gray-600 mb-4">
                Wajah Anda cocok dengan data di database
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  Nama: {result.matchedPerson.name}
                </p>
                {result.matchedPerson.description && (
                  <p className="text-xs text-green-600">
                    {result.matchedPerson.description}
                  </p>
                )}
                <p className="text-xs text-green-600 mt-2">
                  Tingkat kemiripan: {result.similarity}%
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                {result.livenessCheck === false ? (
                  <AlertCircle className="w-24 h-24 text-orange-500" />
                ) : (
                  <XCircle className="w-24 h-24 text-red-500" />
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {result.livenessCheck === false ? 'Verifikasi Gagal' : 'Tidak Cocok'}
              </h3>
              <p className="text-gray-600 mb-4">
                {result.message || 'Wajah Anda tidak cocok dengan data di database'}
              </p>
              {result.livenessCheck === false && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-orange-700">
                    Pastikan Anda menggunakan wajah asli (bukan foto atau video).
                  </p>
                </div>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {result.matched ? 'Tutup' : 'Coba Lagi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifikasiWajahCamera({ params }) {
  const { id } = use(params);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [facingStraight, setFacingStraight] = useState(false);
  const [faceOrientation, setFaceOrientation] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // { matched: boolean, matchedPerson: object, similarity: number }

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        console.log("Face detection models loaded successfully");
      } catch (err) {
        console.error("Error loading face detection models:", err);
        setError("Gagal memuat model deteksi wajah. Silakan refresh halaman.");
      }
    };

    loadModels();
  }, []);

  // Start face detection when camera is ready and models are loaded
  useEffect(() => {
    if (!modelsLoaded || !cameraReady) return;

    const detectFace = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        if (!canvas) return;

        // Set canvas dimensions to match video
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);

        try {
          // Detect faces
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (detections && detections.length > 0) {
            setFaceDetected(true);

            // Get landmarks for orientation calculation
            const landmarks = detections[0].landmarks;
            const positions = landmarks.positions;

            // Calculate face orientation using landmark positions
            // Using key points: nose tip, left eye, right eye
            const noseTip = positions[30]; // Nose tip
            const leftEye = positions[36]; // Left eye outer corner
            const rightEye = positions[45]; // Right eye outer corner
            const chin = positions[8]; // Chin point
            const forehead = positions[27]; // Between eyebrows

            // Calculate yaw (horizontal rotation) - looking left/right
            const eyeCenter = {
              x: (leftEye.x + rightEye.x) / 2,
              y: (leftEye.y + rightEye.y) / 2
            };
            const faceWidth = Math.abs(rightEye.x - leftEye.x);
            const noseToCenterX = noseTip.x - eyeCenter.x;
            const yaw = (noseToCenterX / faceWidth) * 100; // Normalize to percentage

            // Calculate pitch (vertical rotation) - looking up/down
            const faceHeight = Math.abs(chin.y - forehead.y);
            const noseToCenterY = noseTip.y - eyeCenter.y;
            // pitch: positive when nose is below eye center (looking down)
            //        negative when nose is above eye center (looking up)
            // Natural face has nose ~15-18% below eye center, so we offset
            const rawPitch = (noseToCenterY / faceHeight) * 100;
            const pitch = rawPitch - 17; // Offset by 17% to account for natural face geometry

            // Calculate roll (head tilt) - tilting left/right
            // Using the angle between the two eyes
            const eyeDeltaY = rightEye.y - leftEye.y;
            const eyeDeltaX = rightEye.x - leftEye.x;
            const rollRadians = Math.atan2(eyeDeltaY, eyeDeltaX);
            const roll = rollRadians * (180 / Math.PI); // Convert to degrees
            // Positive roll = head tilted clockwise (right ear to shoulder)
            // Negative roll = head tilted counter-clockwise (left ear to shoulder)

            setFaceOrientation({ yaw, pitch, roll });

            // Check if facing straight (strict yaw: ±12, asymmetric pitch: +18/-5, strict roll: ±8)
            // More lenient for looking down (natural position), very strict for looking up
            // Very strict for head tilt (roll)
            const isFacingStraight = Math.abs(yaw) < 12 && pitch > -5 && pitch < 18 && Math.abs(roll) < 8;
            setFacingStraight(isFacingStraight);

            // Draw detections on canvas
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw face detection box with color based on orientation
            if (isFacingStraight) {
              // Green box when facing straight
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
            } else {
              // Orange box when not facing straight
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 3;
            }

            const box = resizedDetections[0].detection.box;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw face landmarks
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          } else {
            setFaceDetected(false);
            setFacingStraight(false);
            // Clear canvas when no face detected
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        } catch (err) {
          console.error("Error during face detection:", err);
        }
      }
    };

    // Run detection every 300ms
    detectionIntervalRef.current = setInterval(detectFace, 300);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [modelsLoaded, cameraReady]);

  const handleUserMedia = () => {
    setCameraReady(true);
  };

  // Countdown and snapshot when face is straight
  useEffect(() => {
    let timer;

    if (facingStraight && !isProcessing && !verificationResult && countdown === null) {
      // Start countdown from 3
      setCountdown(3);
    }

    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Countdown finished, take snapshot
      captureAndVerify();
    }

    return () => clearTimeout(timer);
  }, [facingStraight, countdown, isProcessing, verificationResult]);

  // Reset countdown when face is not straight
  useEffect(() => {
    if (!facingStraight && countdown !== null && !isProcessing) {
      setCountdown(null);
    }
  }, [facingStraight, countdown, isProcessing]);

  const captureAndVerify = async () => {
    if (!webcamRef.current) return;

    setIsProcessing(true);
    setCountdown(null);

    try {
      // Capture multiple frames for liveness check (0.5 second apart)
      const frame1 = webcamRef.current.getScreenshot();

      await new Promise(resolve => setTimeout(resolve, 500));
      const frame2 = webcamRef.current.getScreenshot();

      await new Promise(resolve => setTimeout(resolve, 500));
      const frame3 = webcamRef.current.getScreenshot();

      // Call API to verify face with liveness check
      const response = await fetch('/api/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: frame2, // Use middle frame as primary
          frames: [frame1, frame2, frame3] // Send all frames for liveness analysis
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationResult(result);
      } else {
        setError(result.error || 'Verifikasi gagal');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error during verification:', err);
      setError('Terjadi kesalahan saat verifikasi');
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setVerificationResult(null);
    setIsProcessing(false);
    setCountdown(null);
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (!modelsLoaded) return "Memuat model deteksi wajah...";
    if (!cameraReady) return "Menginisialisasi kamera...";
    if (!faceDetected) return "Menunggu wajah terdeteksi...";
    if (!facingStraight) return "Hadapkan wajah Anda lurus ke kamera";
    return "Wajah terdeteksi dan lurus! Menunggu verifikasi...";
  };

  const getOrientationGuidance = () => {
    if (!faceDetected || facingStraight) return null;

    const { yaw, pitch, roll } = faceOrientation;
    const guidance = [];

    // Roll (head tilt) - check first as it's most important
    if (Math.abs(roll) >= 8) {
      if (roll > 8) guidance.push("Luruskan kepala Anda (miring ke KANAN)");
      else if (roll < -8) guidance.push("Luruskan kepala Anda (miring ke KIRI)");
    }

    // Yaw: positive = nose to right, negative = nose to left
    // When nose is to the right, user needs to turn face to the LEFT
    if (yaw > 12) guidance.push("Putar wajah ke KANAN");
    else if (yaw < -12) guidance.push("Putar wajah ke KIRI");

    // Pitch: positive = nose below eye center (chin tucked/looking down), negative = nose above (looking up)
    // When looking down (positive pitch), tell user to raise chin
    // Very strict for looking up (to catch face-up earlier)
    if (pitch > 18) guidance.push("Angkat dagu Anda");
    else if (pitch < -5) guidance.push("Turunkan dagu Anda");

    return guidance.join(", ");
  };

  const getBorderColor = () => {
    if (error) return "border-red-500";
    if (!modelsLoaded || !cameraReady) return "border-gray-500";
    if (!faceDetected) return "border-yellow-500";
    if (!facingStraight) return "border-orange-500";
    return "border-green-500";
  };

  const getStatusBadge = () => {
    if (error) {
      return {
        bg: "bg-red-500",
        icon: <AlertCircle className="w-5 h-5" />,
        text: "Error",
      };
    }
    if (!modelsLoaded || !cameraReady) {
      return {
        bg: "bg-gray-500",
        icon: <Camera className="w-5 h-5 animate-pulse" />,
        text: "Memuat...",
      };
    }
    if (!faceDetected) {
      return {
        bg: "bg-yellow-500",
        icon: <User className="w-5 h-5" />,
        text: "Menunggu Wajah",
      };
    }
    if (!facingStraight) {
      return {
        bg: "bg-orange-500",
        icon: <AlertCircle className="w-5 h-5" />,
        text: "Hadapkan Wajah Lurus",
      };
    }
    return {
      bg: "bg-green-500",
      icon: <User className="w-5 h-5" />,
      text: "Wajah Lurus",
    };
  };

  const statusBadge = getStatusBadge();

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
              Verifikasi Wajah
            </h1>
            <p className="text-lg text-gray-600">{getStatusMessage()}</p>
          </div>

          {/* Camera Feed */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div
              className={`border-8 ${getBorderColor()} transition-colors duration-300 relative`}
            >
              {/* Webcam */}
              <div className="relative w-full aspect-video">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }}
                  onUserMedia={handleUserMedia}
                  className="w-full h-full object-cover"
                />

                {/* Canvas for face detection overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                <div
                  className={`${statusBadge.bg} text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2`}
                >
                  {statusBadge.icon}
                  {statusBadge.text}
                </div>
              </div>

              {/* Face Frame Guide - only show when waiting for face */}
              {modelsLoaded && cameraReady && !faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="relative w-64 h-80 md:w-80 md:h-96">
                    {/* Oval frame */}
                    <div className="absolute inset-0 border-4 border-white/70 rounded-full shadow-lg animate-pulse"></div>

                    {/* Corner markers */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>
                  </div>
                </div>
              )}

              {/* Orientation Guidance Overlay */}
              {faceDetected && !facingStraight && !countdown && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-pulse">
                    <p className="text-sm">{getOrientationGuidance()}</p>
                  </div>
                </div>
              )}

              {/* Countdown Overlay */}
              <CountdownOverlay countdown={countdown} />

              {/* Processing Overlay */}
              {isProcessing && !verificationResult && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                      <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xl text-white mb-2">Memverifikasi wajah...</p>
                    <p className="text-sm text-white/70">
                      Memeriksa keaslian wajah & mencari kecocokan...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Sesi verifikasi: Jadwal #{id}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    modelsLoaded ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span>Model deteksi wajah</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    cameraReady ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span>Kamera aktif</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    faceDetected ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span>Wajah terdeteksi</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    facingStraight ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span>Posisi lurus</span>
              </div>
            </div>

            {/* Orientation warning */}
            {faceDetected && !facingStraight && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  Wajah terdeteksi, tetapi tidak lurus
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {getOrientationGuidance()}
                </p>
              </div>
            )}

            {/* Next steps info */}
            {faceDetected && facingStraight && !countdown && !isProcessing && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Wajah terdeteksi dan posisi sudah lurus!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Memulai verifikasi...
                </p>
              </div>
            )}

            {/* Countdown info */}
            {countdown !== null && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Verifikasi dimulai dalam {countdown}...
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Tetap tahan posisi Anda
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal result={verificationResult} onClose={handleCloseModal} />
    </div>
  );
}
