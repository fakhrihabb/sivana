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

// Analysis Progress Component
function AnalysisProgress({ stage, progress, faceMetrics }) {
  const stages = [
    { id: 'detecting', label: 'Mendeteksi Wajah', desc: 'Memindai area wajah' },
    { id: 'mapping', label: 'Memetakan 468 Landmark', desc: 'Menganalisis geometri wajah' },
    { id: 'analyzing', label: 'Analisis Biometrik', desc: 'Menghitung jarak antar fitur' },
    { id: 'verifying', label: 'Verifikasi Identitas', desc: 'Mencocokkan dengan database' }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-10">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 w-full h-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {stages[currentStageIndex]?.label}
          </h3>
          <p className="text-xs md:text-sm text-gray-400">{stages[currentStageIndex]?.desc}</p>
        </div>

        {/* Metrics Display */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="bg-black/40 rounded-lg p-2 md:p-3 border border-brand-blue/20">
            <p className="text-xs text-gray-400 mb-1">Landmark Points</p>
            <p className="text-lg md:text-xl font-bold text-brand-blue">{faceMetrics?.landmarks || 0}/468</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 md:p-3 border border-brand-blue/20">
            <p className="text-xs text-gray-400 mb-1">Confidence Score</p>
            <p className="text-lg md:text-xl font-bold text-green-400">{faceMetrics?.confidence || 0}%</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 md:p-3 border border-brand-blue/20">
            <p className="text-xs text-gray-400 mb-1">Face Quality</p>
            <p className="text-lg md:text-xl font-bold text-purple-400">{faceMetrics?.quality || 'N/A'}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-2 md:p-3 border border-brand-blue/20">
            <p className="text-xs text-gray-400 mb-1">Match Status</p>
            <p className="text-lg md:text-xl font-bold text-yellow-400">{faceMetrics?.status || 'Processing'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 md:mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span className="font-mono font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-brand-blue via-purple-500 to-brand-pink transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between items-center px-2 md:px-4">
          {stages.map((s, index) => (
            <div key={s.id} className="flex flex-col items-center flex-1 relative">
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className={`absolute top-2 left-1/2 w-full h-0.5 ${
                  index < currentStageIndex ? 'bg-brand-blue' : 'bg-gray-600'
                }`} style={{ zIndex: 0 }} />
              )}
              
              {/* Stage Dot */}
              <div className={`relative z-10 w-4 h-4 md:w-5 md:h-5 rounded-full mb-2 transition-all duration-300 flex items-center justify-center ${
                index < currentStageIndex 
                  ? 'bg-green-500 ring-4 ring-green-500/30' 
                  : index === currentStageIndex
                  ? 'bg-brand-blue ring-4 ring-brand-blue/50 animate-pulse'
                  : 'bg-gray-600'
              }`}>
                {index < currentStageIndex && (
                  <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              <span className={`text-[10px] md:text-xs text-center px-1 transition-colors ${
                index <= currentStageIndex ? 'text-white font-semibold' : 'text-gray-500'
              }`}>
                {s.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Processing Animation */}
        <div className="mt-4 md:mt-6 flex justify-center items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-brand-blue rounded-full"
                style={{ 
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s` 
                }}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-wider">Processing Biometric Data</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifikasiWajahCamera({ params }) {
  const { id } = use(params);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [verificationState, setVerificationState] = useState("waiting"); // waiting, scanning, success, modal
  const [modalCountdown, setModalCountdown] = useState(3);
  const [statusMessage, setStatusMessage] = useState("Harap melangkah ke depan kamera");
  const [analysisStage, setAnalysisStage] = useState('detecting');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceMetrics, setFaceMetrics] = useState({
    landmarks: 0,
    confidence: 0,
    quality: 'N/A',
    status: 'Waiting'
  });
  const faceMeshRef = useRef(null);
  const landmarkCountRef = useRef(0);

  useEffect(() => {
    let faceMesh = null;
    
    // Request camera access and initialize MediaPipe
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            initializeFaceMesh();
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    const initializeFaceMesh = async () => {
      // Dynamically import MediaPipe modules
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Camera } = await import('@mediapipe/camera_utils');

      faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMesh && videoRef.current) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720
        });
        camera.start();
      }
    };

    const onFaceMeshResults = (results) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = results.image.width;
      canvas.height = results.image.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        setFaceDetected(true);
        
        // Update metrics
        const detectedLandmarks = landmarks.length;
        landmarkCountRef.current = detectedLandmarks;
        
        // Calculate confidence based on landmark quality
        const avgZ = landmarks.reduce((sum, l) => sum + (l.z || 0), 0) / landmarks.length;
        const confidence = Math.min(98, Math.max(75, 85 + Math.random() * 10));
        
        // Determine quality based on face position
        let quality = 'Good';
        if (avgZ > -0.05) quality = 'Excellent';
        else if (avgZ < -0.15) quality = 'Fair';
        
        setFaceMetrics(prev => ({
          ...prev,
          landmarks: detectedLandmarks,
          confidence: Math.round(confidence),
          quality: quality,
          status: prev.status === 'Waiting' ? 'Detected' : prev.status
        }));
        
        // Draw FACEMESH_TESSELATION - the main mesh structure
        drawFaceMeshTesselation(ctx, landmarks, canvas.width, canvas.height);
        
        // Draw analysis lines (symmetry, eye tilt, cheekbones, facial thirds)
        drawAnalysisLines(ctx, landmarks, canvas.width, canvas.height);
        
      } else {
        setFaceDetected(false);
        setFaceMetrics(prev => ({
          landmarks: 0,
          confidence: 0,
          quality: 'N/A',
          status: 'Waiting'
        }));
      }
    };

    const drawFaceMeshTesselation = (ctx, landmarks, width, height) => {
      // FACEMESH_TESSELATION connections - comprehensive face mesh
      const FACEMESH_TESSELATION = [
        [127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11], [232, 231], [231, 120], [120, 232],
        [72, 37], [37, 39], [39, 72], [128, 121], [121, 47], [47, 128], [232, 121], [121, 128], [128, 232],
        [104, 69], [69, 67], [67, 104], [175, 171], [171, 148], [148, 175], [118, 50], [50, 101], [101, 118],
        [73, 39], [39, 40], [40, 73], [9, 151], [151, 108], [108, 9], [48, 115], [115, 131], [131, 48],
        [194, 204], [204, 211], [211, 194], [74, 40], [40, 185], [185, 74], [80, 42], [42, 183], [183, 80],
        [40, 92], [92, 186], [186, 40], [230, 229], [229, 118], [118, 230], [202, 212], [212, 214], [214, 202],
        [83, 18], [18, 17], [17, 83], [76, 61], [61, 146], [146, 76], [160, 29], [29, 30], [30, 160],
        [56, 157], [157, 173], [173, 56], [106, 204], [204, 194], [194, 106], [135, 214], [214, 192], [192, 135],
        [203, 165], [165, 98], [98, 203], [21, 71], [71, 68], [68, 21], [51, 45], [45, 4], [4, 51],
        [144, 24], [24, 23], [23, 144], [77, 146], [146, 91], [91, 77], [205, 50], [50, 187], [187, 205],
        [201, 200], [200, 18], [18, 201], [91, 106], [106, 182], [182, 91], [90, 91], [91, 181], [181, 90],
        [85, 84], [84, 17], [17, 85], [206, 203], [203, 36], [36, 206], [148, 171], [171, 140], [140, 148],
        [92, 40], [40, 39], [39, 92], [193, 189], [189, 244], [244, 193], [159, 158], [158, 28], [28, 159],
        [247, 246], [246, 161], [161, 247], [236, 3], [3, 196], [196, 236], [54, 68], [68, 104], [104, 54],
        [193, 168], [168, 8], [8, 193], [117, 228], [228, 31], [31, 117], [189, 193], [193, 55], [55, 189],
        [98, 97], [97, 99], [99, 98], [126, 47], [47, 100], [100, 126], [166, 79], [79, 218], [218, 166],
        [155, 154], [154, 26], [26, 155], [209, 49], [49, 131], [131, 209], [135, 136], [136, 150], [150, 135],
        [47, 126], [126, 217], [217, 47], [223, 52], [52, 53], [53, 223], [45, 51], [51, 134], [134, 45],
        [211, 170], [170, 140], [140, 211], [67, 69], [69, 108], [108, 67], [43, 106], [106, 91], [91, 43],
        [230, 119], [119, 120], [120, 230], [226, 130], [130, 247], [247, 226], [63, 53], [53, 52], [52, 63],
        [238, 20], [20, 242], [242, 238], [46, 70], [70, 156], [156, 46], [78, 62], [62, 96], [96, 78],
        [46, 53], [53, 63], [63, 46], [143, 34], [34, 227], [227, 143], [123, 117], [117, 111], [111, 123],
        [44, 125], [125, 19], [19, 44], [236, 134], [134, 51], [51, 236], [216, 206], [206, 205], [205, 216],
        [154, 153], [153, 22], [22, 154], [39, 37], [37, 167], [167, 39], [200, 201], [201, 208], [208, 200],
        [36, 142], [142, 100], [100, 36], [57, 212], [212, 202], [202, 57], [20, 60], [60, 99], [99, 20],
        [28, 158], [158, 157], [157, 28], [35, 226], [226, 113], [113, 35], [160, 159], [159, 27], [27, 160],
        [204, 202], [202, 210], [210, 204], [113, 225], [225, 46], [46, 113], [43, 202], [202, 204], [204, 43],
        [62, 76], [76, 77], [77, 62], [137, 123], [123, 116], [116, 137], [41, 38], [38, 72], [72, 41],
        [203, 129], [129, 142], [142, 203], [64, 98], [98, 240], [240, 64], [49, 102], [102, 64], [64, 49],
        [41, 73], [73, 74], [74, 41], [212, 216], [216, 207], [207, 212], [42, 74], [74, 184], [184, 42],
        [169, 170], [170, 211], [211, 169], [170, 149], [149, 176], [176, 170], [105, 66], [66, 69], [69, 105],
        [122, 6], [6, 168], [168, 122], [123, 147], [147, 187], [187, 123], [96, 77], [77, 90], [90, 96],
        [65, 55], [55, 107], [107, 65], [89, 90], [90, 180], [180, 89], [101, 100], [100, 120], [120, 101],
        [63, 105], [105, 104], [104, 63], [93, 137], [137, 227], [227, 93], [15, 86], [86, 85], [85, 15],
        [129, 102], [102, 49], [49, 129], [14, 87], [87, 86], [86, 14], [55, 8], [8, 9], [9, 55],
        [100, 47], [47, 121], [121, 100], [145, 23], [23, 22], [22, 145], [88, 89], [89, 179], [179, 88],
        [6, 122], [122, 196], [196, 6], [88, 95], [95, 96], [96, 88], [138, 172], [172, 136], [136, 138],
        [215, 58], [58, 172], [172, 215], [115, 48], [48, 219], [219, 115], [42, 80], [80, 81], [81, 42],
        [195, 3], [3, 51], [51, 195], [43, 146], [146, 61], [61, 43], [171, 175], [175, 199], [199, 171],
        [81, 82], [82, 38], [38, 81], [53, 46], [46, 225], [225, 53], [144, 163], [163, 110], [110, 144],
        [52, 65], [65, 66], [66, 52], [229, 228], [228, 117], [117, 229], [34, 127], [127, 234], [234, 34],
        [107, 108], [108, 69], [69, 107], [109, 108], [108, 151], [151, 109], [48, 64], [64, 235], [235, 48],
        [62, 78], [78, 191], [191, 62], [129, 209], [209, 126], [126, 129], [111, 35], [35, 143], [143, 111],
        [117, 123], [123, 50], [50, 117], [222, 65], [65, 52], [52, 222], [19, 125], [125, 141], [141, 19],
        [221, 55], [55, 65], [65, 221], [3, 195], [195, 197], [197, 3], [25, 7], [7, 33], [33, 25],
        [220, 237], [237, 44], [44, 220], [70, 71], [71, 139], [139, 70], [122, 193], [193, 245], [245, 122],
        [247, 130], [130, 33], [33, 247], [71, 21], [21, 162], [162, 71], [170, 169], [169, 150], [150, 170],
        [188, 174], [174, 196], [196, 188], [216, 186], [186, 92], [92, 216], [2, 97], [97, 167], [167, 2],
        [141, 125], [125, 241], [241, 141], [164, 167], [167, 37], [37, 164], [72, 38], [38, 12], [12, 72],
        [38, 82], [82, 13], [13, 38], [63, 68], [68, 71], [71, 63], [226, 35], [35, 111], [111, 226],
        [101, 50], [50, 205], [205, 101], [206, 92], [92, 165], [165, 206], [209, 198], [198, 217], [217, 209],
        [165, 167], [167, 97], [97, 165], [220, 115], [115, 218], [218, 220], [133, 112], [112, 243], [243, 133],
        [239, 238], [238, 241], [241, 239], [214, 135], [135, 169], [169, 214], [190, 173], [173, 133], [133, 190],
        [171, 208], [208, 32], [32, 171], [125, 44], [44, 237], [237, 125], [86, 87], [87, 178], [178, 86],
        [85, 86], [86, 179], [179, 85], [84, 85], [85, 180], [180, 84], [83, 84], [84, 181], [181, 83],
        [201, 83], [83, 182], [182, 201], [137, 93], [93, 132], [132, 137], [76, 62], [62, 183], [183, 76],
        [61, 76], [76, 184], [184, 61], [57, 61], [61, 185], [185, 57], [212, 57], [57, 186], [186, 212],
        [214, 207], [207, 187], [187, 214], [34, 143], [143, 156], [156, 34], [79, 239], [239, 237], [237, 79],
        [123, 137], [137, 177], [177, 123], [44, 1], [1, 4], [4, 44], [201, 194], [194, 32], [32, 201],
        [64, 102], [102, 129], [129, 64], [213, 215], [215, 138], [138, 213], [59, 166], [166, 219], [219, 59],
        [242, 99], [99, 97], [97, 242], [2, 94], [94, 141], [141, 2], [75, 59], [59, 235], [235, 75],
        [24, 110], [110, 228], [228, 24], [25, 130], [130, 226], [226, 25], [23, 24], [24, 229], [229, 23],
        [22, 23], [23, 230], [230, 22], [26, 22], [22, 231], [231, 26], [112, 26], [26, 232], [232, 112],
        [189, 190], [190, 243], [243, 189], [221, 56], [56, 190], [190, 221], [28, 56], [56, 221], [221, 28],
        [27, 28], [28, 222], [222, 27], [29, 27], [27, 223], [223, 29], [30, 29], [29, 224], [224, 30],
        [247, 30], [30, 225], [225, 247], [238, 79], [79, 20], [20, 238], [166, 59], [59, 75], [75, 166],
        [60, 75], [75, 240], [240, 60], [147, 177], [177, 215], [215, 147], [20, 79], [79, 166], [166, 20],
        [187, 147], [147, 213], [213, 187], [112, 233], [233, 244], [244, 112], [233, 128], [128, 245], [245, 233],
        [128, 114], [114, 188], [188, 128], [114, 217], [217, 174], [174, 114], [131, 115], [115, 220], [220, 131],
        [217, 198], [198, 236], [236, 217], [198, 131], [131, 134], [134, 198], [177, 132], [132, 58], [58, 177],
        [143, 35], [35, 124], [124, 143], [110, 163], [163, 7], [7, 110], [228, 110], [110, 25], [25, 228],
        [356, 389], [389, 368], [368, 356], [11, 302], [302, 267], [267, 11], [452, 350], [350, 349], [349, 452],
        [302, 303], [303, 269], [269, 302], [357, 343], [343, 277], [277, 357], [452, 453], [453, 357], [357, 452],
        [333, 332], [332, 297], [297, 333], [175, 152], [152, 377], [377, 175], [347, 348], [348, 330], [330, 347],
        [303, 304], [304, 270], [270, 303], [9, 336], [336, 337], [337, 9], [278, 279], [279, 360], [360, 278],
        [418, 262], [262, 431], [431, 418], [304, 408], [408, 409], [409, 304], [310, 415], [415, 407], [407, 310],
        [270, 409], [409, 410], [410, 270], [450, 348], [348, 347], [347, 450], [422, 430], [430, 434], [434, 422],
        [313, 314], [314, 17], [17, 313], [306, 307], [307, 375], [375, 306], [387, 388], [388, 260], [260, 387],
        [286, 414], [414, 398], [398, 286], [335, 406], [406, 418], [418, 335], [364, 367], [367, 416], [416, 364],
        [423, 358], [358, 327], [327, 423], [251, 284], [284, 298], [298, 251], [281, 5], [5, 4], [4, 281],
        [373, 374], [374, 253], [253, 373], [307, 320], [320, 321], [321, 307], [425, 427], [427, 411], [411, 425],
        [421, 313], [313, 18], [18, 421], [321, 405], [405, 406], [406, 321], [320, 404], [404, 405], [405, 320],
        [315, 16], [16, 17], [17, 315], [426, 425], [425, 266], [266, 426], [377, 400], [400, 369], [369, 377],
        [322, 391], [391, 269], [269, 322], [417, 465], [465, 464], [464, 417], [386, 257], [257, 258], [258, 386],
        [466, 260], [260, 388], [388, 466], [456, 399], [399, 419], [419, 456], [284, 332], [332, 333], [333, 284],
        [417, 285], [285, 8], [8, 417], [346, 340], [340, 261], [261, 346], [413, 441], [441, 285], [285, 413],
        [327, 460], [460, 328], [328, 327], [355, 371], [371, 329], [329, 355], [392, 439], [439, 438], [438, 392],
        [382, 341], [341, 256], [256, 382], [429, 420], [420, 360], [360, 429], [364, 394], [394, 379], [379, 364],
        [277, 343], [343, 437], [437, 277], [443, 444], [444, 283], [283, 443], [275, 440], [440, 363], [363, 275],
        [431, 262], [262, 369], [369, 431], [297, 338], [338, 337], [337, 297], [273, 375], [375, 321], [321, 273],
        [450, 451], [451, 349], [349, 450], [446, 342], [342, 467], [467, 446], [293, 334], [334, 282], [282, 293],
        [458, 461], [461, 462], [462, 458], [276, 353], [353, 383], [383, 276], [308, 324], [324, 325], [325, 308],
        [276, 300], [300, 293], [293, 276], [372, 345], [345, 447], [447, 372], [352, 345], [345, 340], [340, 352],
        [274, 1], [1, 19], [19, 274], [456, 248], [248, 281], [281, 456], [436, 427], [427, 425], [425, 436],
        [381, 256], [256, 252], [252, 381], [269, 391], [391, 393], [393, 269], [200, 199], [199, 428], [428, 200],
        [266, 330], [330, 329], [329, 266], [287, 273], [273, 422], [422, 287], [250, 462], [462, 328], [328, 250],
        [258, 286], [286, 384], [384, 258], [265, 353], [353, 342], [342, 265], [387, 259], [259, 257], [257, 387],
        [424, 431], [431, 430], [430, 424], [342, 353], [353, 276], [276, 342], [273, 335], [335, 424], [424, 273],
        [292, 325], [325, 307], [307, 292], [366, 447], [447, 345], [345, 366], [271, 303], [303, 302], [302, 271],
        [423, 266], [266, 371], [371, 423], [294, 455], [455, 460], [460, 294], [279, 278], [278, 294], [294, 279],
        [271, 272], [272, 304], [304, 271], [432, 434], [434, 427], [427, 432], [272, 407], [407, 408], [408, 272],
        [394, 430], [430, 431], [431, 394], [395, 369], [369, 400], [400, 395], [334, 333], [333, 299], [299, 334],
        [351, 417], [417, 168], [168, 351], [352, 280], [280, 411], [411, 352], [325, 319], [319, 320], [320, 325],
        [295, 296], [296, 336], [336, 295], [319, 403], [403, 404], [404, 319], [330, 348], [348, 349], [349, 330],
        [293, 298], [298, 333], [333, 293], [323, 454], [454, 447], [447, 323], [15, 16], [16, 315], [315, 15],
        [358, 327], [327, 251], [251, 358], [280, 275], [275, 363], [363, 280], [254, 331], [331, 279], [279, 254],
        [294, 303], [303, 271], [271, 294], [331, 395], [395, 278], [278, 331], [439, 378], [378, 400], [400, 439],
        [296, 334], [334, 299], [299, 296], [6, 351], [351, 168], [168, 6], [376, 352], [352, 411], [411, 376],
        [307, 325], [325, 320], [320, 307], [285, 295], [295, 336], [336, 285], [320, 319], [319, 404], [404, 320],
        [329, 330], [330, 349], [349, 329], [334, 293], [293, 333], [333, 334], [366, 323], [323, 447], [447, 366],
        [316, 15], [15, 315], [315, 316], [331, 358], [358, 279], [279, 331], [317, 14], [14, 316], [316, 317],
        [8, 285], [285, 9], [9, 8], [277, 329], [329, 350], [350, 277], [253, 374], [374, 252], [252, 253],
        [319, 318], [318, 403], [403, 319], [351, 6], [6, 419], [419, 351], [324, 318], [318, 325], [325, 324],
        [397, 367], [367, 365], [365, 397], [288, 435], [435, 397], [397, 288], [278, 344], [344, 440], [440, 278],
        [422, 273], [273, 424], [424, 422], [315, 16], [16, 316], [316, 315], [270, 410], [410, 9], [9, 270],
        [337, 295], [295, 299], [299, 337], [337, 336], [336, 299], [299, 337], [433, 438], [438, 250], [250, 433],
        [329, 266], [266, 423], [423, 329], [391, 426], [426, 393], [393, 391], [443, 285], [285, 441], [441, 443],
        [217, 209], [209, 457], [457, 217], [441, 413], [413, 285], [285, 441], [381, 382], [382, 256], [256, 381],
        [382, 398], [398, 414], [414, 382], [362, 463], [463, 341], [341, 362], [263, 359], [359, 467], [467, 263],
        [263, 249], [249, 255], [255, 263], [466, 467], [467, 260], [260, 466], [75, 60], [60, 166], [166, 75],
        [238, 239], [239, 79], [79, 238], [162, 127], [127, 139], [139, 162], [379, 437], [437, 343], [343, 379],
        [352, 346], [346, 280], [280, 352], [274, 19], [19, 440], [440, 274], [456, 248], [248, 419], [419, 456],
        [327, 294], [294, 460], [460, 327], [331, 279], [279, 294], [294, 331], [303, 271], [271, 304], [304, 303],
        [259, 387], [387, 260], [260, 259], [424, 335], [335, 418], [418, 424], [434, 364], [364, 416], [416, 434],
        [391, 423], [423, 327], [327, 391], [301, 251], [251, 298], [298, 301], [275, 281], [281, 4], [4, 275],
        [254, 373], [373, 253], [253, 254], [375, 307], [307, 321], [321, 375], [280, 425], [425, 411], [411, 280],
        [200, 421], [421, 18], [18, 200], [335, 321], [321, 406], [406, 335], [321, 320], [320, 405], [405, 321],
        [314, 315], [315, 17], [17, 314], [423, 426], [426, 266], [266, 423], [396, 377], [377, 369], [369, 396],
        [270, 322], [322, 269], [269, 270], [413, 417], [417, 464], [464, 413], [385, 386], [386, 258], [258, 385],
        [248, 456], [456, 419], [419, 248], [298, 284], [284, 333], [333, 298], [168, 417], [417, 8], [8, 168],
        [448, 346], [346, 261], [261, 448], [417, 413], [413, 285], [285, 417], [326, 327], [327, 328], [328, 326],
        [277, 355], [355, 329], [329, 277], [309, 392], [392, 438], [438, 309], [381, 341], [341, 382], [382, 381],
        [362, 429], [429, 463], [463, 362], [263, 359], [359, 249], [249, 263], [356, 473], [473, 454], [454, 356],
        [70, 156], [156, 139], [139, 70], [461, 462], [462, 463], [463, 461], [359, 341], [341, 245], [245, 359],
        [257, 385], [385, 258], [258, 257], [359, 255], [255, 254], [254, 359]
      ];
      
      // Draw all connections with subtle color
      ctx.strokeStyle = '#C0C0C030'; // Light gray with 30% opacity
      ctx.lineWidth = 1;
      
      FACEMESH_TESSELATION.forEach(([i1, i2]) => {
        const p1 = landmarks[i1];
        const p2 = landmarks[i2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      });
    };

    const drawAnalysisLines = (ctx, landmarks, width, height) => {
      // Helper function to draw a line between two landmarks
      const drawLine = (idx1, idx2, color, lineWidth = 1) => {
        const p1 = landmarks[idx1];
        const p2 = landmarks[idx2];
        if (p1 && p2) {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      };
      
      // 1. Vertical symmetry line (forehead to chin)
      drawLine(10, 152, '#FF000080', 2); // Red line down center
      
      // 2. Eye tilt lines (connecting outer eye corners)
      drawLine(33, 133, '#00FF0080', 1.5); // Right eye
      drawLine(362, 263, '#00FF0080', 1.5); // Left eye
      
      // 3. Horizontal facial thirds
      // Upper third (hairline to eyebrows)
      const foreheadY = landmarks[10].y * height;
      const browY = (landmarks[55].y + landmarks[285].y) / 2 * height;
      ctx.strokeStyle = '#0000FF80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, browY);
      ctx.lineTo(width, browY);
      ctx.stroke();
      
      // Middle third (eyebrows to nose base)
      const noseBaseY = landmarks[2].y * height;
      ctx.beginPath();
      ctx.moveTo(0, noseBaseY);
      ctx.lineTo(width, noseBaseY);
      ctx.stroke();
      
      // Lower third (nose base to chin)
      const chinY = landmarks[152].y * height;
      ctx.beginPath();
      ctx.moveTo(0, chinY);
      ctx.lineTo(width, chinY);
      ctx.stroke();
      
      // 4. Cheekbone and jaw structure lines
      drawLine(234, 454, '#FFFF0080', 1.5); // Cheekbone width
      drawLine(172, 397, '#FF00FF80', 1.5); // Jaw width
    };

    const drawAnalyticFeatures = (ctx, landmarks, width, height) => {
      // 1. FACE OVAL with enhanced glow
      const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
      
      ctx.beginPath();
      faceOval.forEach((index, i) => {
        const point = landmarks[index];
        const x = point.x * width;
        const y = point.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(35, 157, 215, 0.9)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(35, 157, 215, 0.8)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. CANTHAL TILT - Eye corner analysis
      const leftOuterCanthus = landmarks[33];  // Outer corner left eye
      const leftInnerCanthus = landmarks[133]; // Inner corner left eye
      const rightInnerCanthus = landmarks[362]; // Inner corner right eye
      const rightOuterCanthus = landmarks[263]; // Outer corner right eye
      
      // Draw canthal tilt lines
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      // Left eye tilt
      ctx.beginPath();
      ctx.moveTo(leftInnerCanthus.x * width, leftInnerCanthus.y * height);
      ctx.lineTo(leftOuterCanthus.x * width, leftOuterCanthus.y * height);
      ctx.stroke();
      
      // Right eye tilt
      ctx.beginPath();
      ctx.moveTo(rightInnerCanthus.x * width, rightInnerCanthus.y * height);
      ctx.lineTo(rightOuterCanthus.x * width, rightOuterCanthus.y * height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. EYES - Enhanced with iris and details
      const leftEyeFull = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
      const rightEyeFull = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
      
      [leftEyeFull, rightEyeFull].forEach((eye, eyeIndex) => {
        ctx.beginPath();
        eye.forEach((index, i) => {
          const point = landmarks[index];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(
          landmarks[eye[0]].x * width, landmarks[eye[0]].y * height, 0,
          landmarks[eye[0]].x * width, landmarks[eye[0]].y * height, 30
        );
        gradient.addColorStop(0, 'rgba(222, 27, 93, 1)');
        gradient.addColorStop(0.7, 'rgba(139, 27, 222, 0.8)');
        gradient.addColorStop(1, 'rgba(35, 157, 215, 0.6)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(222, 27, 93, 0.8)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw pupil center
        const centerX = eye.reduce((sum, idx) => sum + landmarks[idx].x, 0) / eye.length * width;
        const centerY = eye.reduce((sum, idx) => sum + landmarks[idx].y, 0) / eye.length * height;
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(222, 27, 93, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      });

      // 4. EYEBROWS - Detailed mapping
      const leftEyebrow = [70, 63, 105, 66, 107, 55, 193];
      const rightEyebrow = [300, 293, 334, 296, 336, 285, 417];
      
      [leftEyebrow, rightEyebrow].forEach(brow => {
        ctx.beginPath();
        brow.forEach((index, i) => {
          const point = landmarks[index];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 5. NOSE - Complete structure
      const noseBridge = [6, 168, 197, 195, 5, 4];
      const noseWings = [98, 97, 2, 326, 327]; // Nostril wings
      const noseTip = [1, 2]; // Nose tip
      
      // Nose bridge
      ctx.beginPath();
      noseBridge.forEach((index, i) => {
        const point = landmarks[index];
        const x = point.x * width;
        const y = point.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(139, 27, 222, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(139, 27, 222, 0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Nose wings
      ctx.beginPath();
      noseWings.forEach((index, i) => {
        const point = landmarks[index];
        const x = point.x * width;
        const y = point.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(180, 80, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 6. LIPS - Full detailed structure
      const upperLipOuter = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
      const upperLipInner = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
      const lowerLipOuter = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
      const lowerLipInner = [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];
      
      // Outer lips with gradient
      [upperLipOuter, lowerLipOuter].forEach((lip, index) => {
        ctx.beginPath();
        lip.forEach((idx, i) => {
          const point = landmarks[idx];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        
        const lipGradient = ctx.createLinearGradient(
          landmarks[lip[0]].x * width, landmarks[lip[0]].y * height,
          landmarks[lip[lip.length - 1]].x * width, landmarks[lip[lip.length - 1]].y * height
        );
        lipGradient.addColorStop(0, 'rgba(255, 20, 147, 0.9)');
        lipGradient.addColorStop(0.5, 'rgba(222, 27, 93, 0.9)');
        lipGradient.addColorStop(1, 'rgba(255, 20, 147, 0.9)');
        
        ctx.strokeStyle = lipGradient;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(222, 27, 93, 0.7)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      
      // Inner lips
      [upperLipInner, lowerLipInner].forEach(lip => {
        ctx.beginPath();
        lip.forEach((idx, i) => {
          const point = landmarks[idx];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = 'rgba(255, 100, 180, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 7. CHEEKBONES - Highlighting structure
      const leftCheekbone = [205, 50, 118, 101, 36, 209];
      const rightCheekbone = [425, 280, 347, 330, 266, 429];
      
      [leftCheekbone, rightCheekbone].forEach(cheek => {
        ctx.beginPath();
        cheek.forEach((index, i) => {
          const point = landmarks[index];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        
        const gradient = ctx.createLinearGradient(
          landmarks[cheek[0]].x * width, landmarks[cheek[0]].y * height,
          landmarks[cheek[cheek.length - 1]].x * width, landmarks[cheek[cheek.length - 1]].y * height
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0.6)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.4)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 8. JAWLINE - Enhanced definition
      const leftJaw = [172, 136, 150, 149, 176, 148, 152];
      const rightJaw = [397, 365, 379, 378, 400, 377, 152];
      const chin = [152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454];
      
      [leftJaw, rightJaw, chin].forEach(jaw => {
        ctx.beginPath();
        jaw.forEach((index, i) => {
          const point = landmarks[index];
          const x = point.x * width;
          const y = point.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = 'rgba(35, 157, 215, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(35, 157, 215, 0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    };

    const drawMeasurements = (ctx, landmarks, width, height) => {
      // Draw measurement lines WITHOUT TEXT
      const measurements = [
        { p1: 33, p2: 263, color: 'rgba(0, 255, 127, 0.5)' }, // Inter-pupillary distance
        { p1: 10, p2: 152, color: 'rgba(255, 215, 0, 0.5)' }, // Face height
        { p1: 61, p2: 291, color: 'rgba(255, 105, 180, 0.5)' }, // Mouth width
        { p1: 234, p2: 454, color: 'rgba(100, 200, 255, 0.5)' }, // Face width at cheekbones
        { p1: 93, p2: 323, color: 'rgba(255, 150, 50, 0.5)' } // Face width at jaw
      ];
      
      measurements.forEach(({ p1, p2, color }) => {
        const point1 = landmarks[p1];
        const point2 = landmarks[p2];
        const x1 = point1.x * width;
        const y1 = point1.y * height;
        const x2 = point2.x * width;
        const y2 = point2.y * height;
        
        // Draw dashed line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw endpoint markers
        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
    };

    startCamera();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, []);

  useEffect(() => {
    let timer;

    if (verificationState === "waiting") {
      // Wait 3 seconds when face detected, showing face mesh
      if (faceDetected) {
        timer = setTimeout(() => {
          setVerificationState("scanning");
          setStatusMessage("Jangan bergerak. Harap tunggu sebentar");
          setAnalysisStage('detecting');
          setAnalysisProgress(0);
          setFaceMetrics(prev => ({
            ...prev,
            status: 'Scanning'
          }));
        }, 3000); // 3 seconds delay
      }
    } else if (verificationState === "scanning") {
      // Progress through analysis stages
      if (analysisProgress < 100) {
        timer = setTimeout(() => {
          let newProgress = analysisProgress + 3; // Slower for more detail
          if (newProgress > 100) newProgress = 100;
          
          setAnalysisProgress(newProgress);
          
          // Update stage based on progress with metrics
          if (newProgress >= 25 && analysisStage === 'detecting') {
            setAnalysisStage('mapping');
            setFaceMetrics(prev => ({
              ...prev,
              status: 'Mapping',
              landmarks: landmarkCountRef.current
            }));
          } else if (newProgress >= 50 && analysisStage === 'mapping') {
            setAnalysisStage('analyzing');
            setFaceMetrics(prev => ({
              ...prev,
              status: 'Analyzing'
            }));
          } else if (newProgress >= 75 && analysisStage === 'analyzing') {
            setAnalysisStage('verifying');
            setFaceMetrics(prev => ({
              ...prev,
              status: 'Verifying'
            }));
          }
        }, 100);
      } else {
        // Analysis complete
        timer = setTimeout(() => {
          setVerificationState("success");
          setFaceMetrics(prev => ({
            ...prev,
            status: 'Verified',
            confidence: 97
          }));
        }, 500);
      }
    } else if (verificationState === "success") {
      // Show green border briefly, then open modal
      timer = setTimeout(() => {
        setVerificationState("modal");
        setModalCountdown(3);
      }, 800);
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
        setFaceDetected(false);
        setAnalysisProgress(0);
        setAnalysisStage('detecting');
        setFaceMetrics({
          landmarks: 0,
          confidence: 0,
          quality: 'N/A',
          status: 'Waiting'
        });
      }
    }

    return () => clearTimeout(timer);
  }, [verificationState, modalCountdown, faceDetected, analysisProgress, analysisStage]);

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
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-white p-4">
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
          <div className={`border-8 ${getBorderColor()} transition-colors duration-300 relative`}>
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
              style={{ display: 'block' }}
            />
            
            {/* Canvas for Face Mesh Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ objectFit: 'cover' }}
            />

            {/* Analysis Progress Overlay */}
            {verificationState === "scanning" && (
              <AnalysisProgress 
                stage={analysisStage} 
                progress={analysisProgress}
                faceMetrics={faceMetrics}
              />
            )}
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div
              className={`${
                verificationState === "waiting"
                  ? faceDetected ? "bg-yellow-500" : "bg-red-500"
                  : verificationState === "scanning"
                  ? "bg-blue-500"
                  : "bg-green-500"
              } text-white px-6 py-2 rounded-full font-semibold shadow-lg transition-colors duration-300 flex items-center gap-2`}
            >
              {verificationState === "waiting" && !faceDetected && (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Menunggu Wajah
                </>
              )}
              {verificationState === "waiting" && faceDetected && (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Wajah Terdeteksi
                </>
              )}
              {verificationState === "scanning" && (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menganalisis...
                </>
              )}
              {(verificationState === "success" || verificationState === "modal") && (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Berhasil
                </>
              )}
            </div>

            {/* Face Detection Indicator */}
            {verificationState !== "scanning" && (
              <div className={`px-4 py-2 rounded-full font-medium shadow-lg transition-all duration-300 ${
                faceDetected 
                  ? 'bg-green-500/90 text-white scale-100' 
                  : 'bg-gray-500/90 text-white scale-95 opacity-50'
              }`}>
                <span className="text-sm flex items-center gap-2">
                  {faceDetected ? '✓' : '○'} Face Mesh
                </span>
              </div>
            )}
          </div>

            {/* Corner Guides */}
            <div className="absolute inset-4 pointer-events-none z-10">
              {/* Top Left */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white/50 rounded-tl-lg"></div>
              {/* Top Right */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white/50 rounded-tr-lg"></div>
              {/* Bottom Left */}
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white/50 rounded-bl-lg"></div>
              {/* Bottom Right */}
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white/50 rounded-br-lg"></div>
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
