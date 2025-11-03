"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// Dummy application data with documents
const dummyApplicationsData = {
  LAM001: {
    id: "LAM001",
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "081234567890",
    position: "Analis Kebijakan Ahli Pertama",
    submittedDate: "2024-01-15",
    status: "belum_verifikasi",
    documents: [
      {
        id: "ktp",
        name: "KTP",
        filename: "ktp_budi.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "NIK: 3201234567890123\nNama: BUDI SANTOSO\nTempat/Tgl Lahir: JAKARTA, 15-05-1995\nAlamat: JL. MERDEKA NO. 123\nRT/RW: 001/002\nKel/Desa: MENTENG\nKecamatan: MENTENG",
        aiInsight: {
          status: "ms",
          reasons: [
            "KTP masih berlaku hingga seumur hidup",
            "Data diri pada KTP sesuai dengan data pendaftaran",
            "Kualitas dokumen jelas dan mudah terbaca",
            "NIK valid dan terverifikasi dengan format yang benar",
          ],
        },
      },
      {
        id: "ijazah",
        name: "Ijazah Terakhir",
        filename: "ijazah_s1.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "UNIVERSITAS INDONESIA\nIJAZAH SARJANA\nNama: Budi Santoso\nNIM: 1506789012\nProgram Studi: Administrasi Publik\nGelar: S.AP\nTahun Lulus: 2018\nIPK: 3.65",
        aiInsight: {
          status: "ms",
          reasons: [
            "Ijazah dari perguruan tinggi terakreditasi A",
            "Program studi sesuai dengan persyaratan formasi",
            "IPK memenuhi syarat minimum (≥ 3.00)",
            "Tahun kelulusan memenuhi batas maksimal pengalaman kerja",
          ],
        },
      },
      {
        id: "transkrip",
        name: "Transkrip Nilai",
        filename: "transkrip_s1.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "TRANSKRIP NILAI AKADEMIK\nUniversitas Indonesia\nNama: Budi Santoso\nNIM: 1506789012\n\nSemester 1-8\nTotal SKS: 144\nIPK: 3.65\n\nMata Kuliah Inti:\n- Kebijakan Publik: A\n- Administrasi Negara: A-\n- Manajemen Publik: A",
        aiInsight: {
          status: "ms",
          reasons: [
            "IPK konsisten dengan yang tertera di ijazah (3.65)",
            "Total SKS memenuhi standar program sarjana (144 SKS)",
            "Mata kuliah relevan dengan formasi jabatan",
            "Tidak ada nilai D atau E pada mata kuliah inti",
          ],
        },
      },
      {
        id: "surat_lamaran",
        name: "Surat Lamaran",
        filename: "surat_lamaran.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "Kepada Yth.\nPanitia Seleksi CPNS\nKementerian XYZ\n\nDengan hormat,\nSaya yang bertanda tangan di bawah ini:\nNama: Budi Santoso\nTempat/Tanggal Lahir: Jakarta, 15 Mei 1995\n\nMengajukan lamaran untuk mengikuti seleksi CPNS...",
        aiInsight: {
          status: "tms",
          reasons: [
            "FATAL: Surat lamaran tidak menggunakan format resmi yang diwajibkan dalam peraturan teknis seleksi CPNS",
            "FATAL: Nomor formasi tidak tercantum - dokumen tidak dapat diproses tanpa informasi formasi yang jelas",
            "FATAL: Tanggal pembuatan surat tidak ada - melanggar ketentuan administratif persuratan formal",
            "Tidak ada tanda tangan basah yang terlihat pada dokumen",
          ],
        },
      },
      {
        id: "skck",
        name: "SKCK",
        filename: "skck.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "SURAT KETERANGAN CATATAN KEPOLISIAN\nNomor: SKCK/123/I/2024\nNama: BUDI SANTOSO\nNIK: 3201234567890123\nTanggal Terbit: 5 Januari 2024\nBerlaku Hingga: 5 Januari 2025\n\nYang bersangkutan tidak memiliki catatan kriminal.",
        aiInsight: {
          status: "ms",
          reasons: [
            "SKCK masih berlaku (terbit dalam 6 bulan terakhir)",
            "Tidak ada catatan kriminal",
            "Data diri sesuai dengan KTP",
            "Nomor SKCK valid dan terverifikasi",
          ],
        },
      },
      {
        id: "surat_sehat",
        name: "Surat Keterangan Sehat",
        filename: "surat_sehat.pdf",
        uploadedDate: "2024-01-15",
        ocrText: "SURAT KETERANGAN SEHAT\nRumah Sakit Umum Jakarta\nNama: Budi Santoso\nUmur: 28 tahun\nTanggal Pemeriksaan: 10 Januari 2024\n\nHasil: Yang bersangkutan dalam keadaan sehat jasmani dan rohani.",
        aiInsight: {
          status: "ms",
          reasons: [
            "Surat keterangan sehat dari rumah sakit terdaftar",
            "Tanggal pemeriksaan masih relevan (< 3 bulan)",
            "Dinyatakan sehat jasmani dan rohani",
            "Stempel dan tanda tangan dokter lengkap",
          ],
        },
      },
    ],
  },
  LAM002: {
    id: "LAM002",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    phone: "082345678901",
    position: "Auditor Ahli Pertama",
    submittedDate: "2024-01-14",
    status: "belum_verifikasi",
    documents: [
      {
        id: "ktp",
        name: "KTP",
        filename: "ktp_siti.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "NIK: 3301234567890124\nNama: SITI NURHALIZA\nTempat/Tgl Lahir: SEMARANG, 20-08-1994",
        aiInsight: {
          status: "ms",
          reasons: ["KTP valid", "Data sesuai"],
        },
      },
      {
        id: "ijazah",
        name: "Ijazah Terakhir",
        filename: "ijazah_s1_akuntansi.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "UNIVERSITAS GADJAH MADA\nIJAZAH SARJANA\nNama: Siti Nurhaliza\nProgram Studi: Akuntansi\nIPK: 3.75",
        aiInsight: {
          status: "ms",
          reasons: ["Jurusan sesuai dengan formasi Auditor", "IPK di atas standar minimum"],
        },
      },
      {
        id: "transkrip",
        name: "Transkrip Nilai",
        filename: "transkrip_akuntansi.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "TRANSKRIP NILAI\nIPK: 3.75\nTotal SKS: 144",
        aiInsight: {
          status: "ms",
          reasons: ["IPK konsisten dengan ijazah", "SKS memenuhi standar"],
        },
      },
      {
        id: "surat_lamaran",
        name: "Surat Lamaran",
        filename: "surat_lamaran_siti.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "Surat Lamaran CPNS - Auditor\nNama: Siti Nurhaliza",
        aiInsight: {
          status: "ms",
          reasons: ["Format sesuai template", "Nomor formasi tercantum"],
        },
      },
      {
        id: "skck",
        name: "SKCK",
        filename: "skck_siti.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "SKCK - Tidak ada catatan kriminal",
        aiInsight: {
          status: "ms",
          reasons: ["SKCK masih berlaku", "Tidak ada catatan kriminal"],
        },
      },
      {
        id: "surat_sehat",
        name: "Surat Keterangan Sehat",
        filename: "surat_sehat_siti.pdf",
        uploadedDate: "2024-01-14",
        ocrText: "Keterangan Sehat - RS Semarang",
        aiInsight: {
          status: "ms",
          reasons: ["Sehat jasmani dan rohani", "Tanggal pemeriksaan valid"],
        },
      },
    ],
  },
};

// Document Card Component
function DocumentCard({ document, isExpanded, onToggle }) {
  const isMS = document.aiInsight.status === "ms";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-grow">
            <div className={`p-3 rounded-lg ${isMS ? "bg-green-100" : "bg-red-100"}`}>
              <FileText className={`w-6 h-6 ${isMS ? "text-green-700" : "text-red-700"}`} />
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {document.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isMS
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {isMS ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      MS
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      TMS
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{document.filename}</p>
              <div className="text-xs text-gray-500">
                Diunggah: {new Date(document.uploadedDate).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
          {/* OCR Result */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Hasil OCR
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {document.ocrText}
              </pre>
            </div>
          </div>

          {/* AI Insight */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              Analisis AI
            </h4>
            <div
              className={`border-2 rounded-lg p-4 ${
                isMS
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {isMS ? (
                  <CheckCircle className="w-5 h-5 text-green-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-700" />
                )}
                <span
                  className={`font-semibold ${
                    isMS ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {isMS ? "Memenuhi Syarat (MS)" : "Tidak Memenuhi Syarat (TMS)"}
                </span>
              </div>
              <ul className="space-y-2">
                {document.aiInsight.reasons.map((reason, index) => (
                  <li
                    key={index}
                    className={`text-sm flex items-start gap-2 ${
                      isMS ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    <span className="mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overall AI Recommendation Component
function OverallAIRecommendation({ documents }) {
  const tmsDocuments = documents.filter((doc) => doc.aiInsight.status === "tms");
  const msDocuments = documents.filter((doc) => doc.aiInsight.status === "ms");
  const tmsCount = tmsDocuments.length;
  const msCount = msDocuments.length;
  const overallStatus = tmsCount > 0 ? "tms" : "ms";

  return (
    <div className="bg-white border-2 border-brand-blue rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-brand-blue/10 p-3 rounded-lg">
          <Sparkles className="w-6 h-6 text-brand-blue" />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Rekomendasi AI Keseluruhan
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {msCount} Dokumen MS
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-600" />
              {tmsCount} Dokumen TMS
            </span>
          </div>
        </div>
      </div>

      <div
        className={`border-2 rounded-lg p-4 mb-4 ${
          overallStatus === "ms"
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          {overallStatus === "ms" ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-700" />
              <span className="font-bold text-lg text-green-900">
                Rekomendasi: MEMENUHI SYARAT (MS)
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-700" />
              <span className="font-bold text-lg text-red-900">
                Rekomendasi: TIDAK MEMENUHI SYARAT (TMS)
              </span>
            </>
          )}
        </div>

        {overallStatus === "ms" ? (
          <div className="text-sm text-green-800 space-y-2">
            <p className="font-semibold">Semua dokumen memenuhi persyaratan yang ditetapkan.</p>
            <p>Berdasarkan analisis komprehensif terhadap {documents.length} dokumen yang diajukan, seluruh berkas administrasi pelamar telah memenuhi standar dan persyaratan yang ditetapkan dalam peraturan teknis seleksi CPNS. Pelamar disarankan untuk dilanjutkan ke tahap selanjutnya dalam proses seleksi.</p>
          </div>
        ) : (
          <div className="text-sm text-red-800 space-y-3">
            <p className="font-semibold">
              Terdapat {tmsCount} dari {documents.length} dokumen yang tidak memenuhi syarat.
            </p>
            <div>
              <p className="font-semibold mb-2">Dokumen yang Gagal Verifikasi:</p>
              <ul className="space-y-1 ml-4">
                {tmsDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold">{doc.name}</span> - Tidak memenuhi persyaratan administratif yang diwajibkan
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="pt-2 border-t border-red-300">
              Berdasarkan hasil screening dokumen, lamaran ini <span className="font-semibold">tidak dapat diproses lebih lanjut</span> karena terdapat kekurangan pada dokumen persyaratan yang bersifat mandatory. Pelamar disarankan untuk tidak dilanjutkan ke tahap selanjutnya sesuai dengan ketentuan yang berlaku.
            </p>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <span className="font-semibold">Catatan:</span> Analisis AI mungkin tidak selalu akurat.
          Verifikasi dan screening manual oleh admin tetap diperlukan untuk memastikan keputusan yang tepat.
        </div>
      </div>
    </div>
  );
}

// TMS Rejection Modal
function TMSModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerateReason = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setReason(
        "Kepada Yth.\nSdr/i Budi Santoso\n\nBerdasarkan hasil verifikasi dan evaluasi dokumen persyaratan administrasi yang telah dilakukan oleh Panitia Seleksi CPNS, dengan ini kami sampaikan bahwa lamaran Saudara/i untuk formasi Analis Kebijakan Ahli Pertama DINYATAKAN TIDAK MEMENUHI SYARAT (TMS) dan TIDAK DAPAT DIPROSES LEBIH LANJUT.\n\nHal ini dikarenakan terdapat beberapa kekurangan FATAL pada dokumen yang bersifat mandatory:\n\n1. SURAT LAMARAN\n   - Tidak menggunakan format resmi yang diwajibkan dalam peraturan teknis seleksi CPNS\n   - Tidak mencantumkan nomor formasi yang dilamar (WAJIB)\n   - Tidak mencantumkan tanggal pembuatan surat (melanggar ketentuan administratif)\n   - Tidak terlihat tanda tangan basah pada dokumen\n\nSesuai dengan Peraturan BKN dan ketentuan teknis seleksi CPNS, dokumen-dokumen di atas merupakan persyaratan MUTLAK yang harus dipenuhi. Ketidaklengkapan tersebut mengakibatkan lamaran Saudara/i tidak dapat dilanjutkan ke tahap selanjutnya.\n\nDemikian surat pemberitahuan ini kami sampaikan. Kami mengharapkan Saudara/i dapat mempersiapkan dokumen dengan lebih baik pada kesempatan seleksi berikutnya.\n\nHormat kami,\nPanitia Seleksi CPNS"
      );
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
      setIsGenerated(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Konfirmasi TMS (Tidak Memenuhi Syarat)
            </h3>
          </div>
          <p className="text-gray-600">
            Silakan berikan alasan penolakan yang akan dikirimkan melalui email kepada pelamar.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Alasan Penolakan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan penolakan..."
            rows={10}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-blue focus:outline-none transition-colors resize-none"
          />
          {isGenerated && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Konten ini dibuat oleh AI. Harap tinjau dan sesuaikan sebelum mengirim.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerateReason}
          disabled={isGenerating}
          className="w-full mb-4 bg-brand-blue hover:bg-opacity-90 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Membuat Alasan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Buat Alasan dengan AI
            </>
          )}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Catatan:</span> Pesan ini akan digunakan dalam email penolakan
            yang akan dikirimkan kepada pelamar. Pastikan alasan yang diberikan jelas dan profesional.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            Konfirmasi TMS
          </button>
        </div>
      </div>
    </div>
  );
}

// MS Confirmation Modal
function MSModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Konfirmasi MS (Memenuhi Syarat)
          </h3>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menandai lamaran ini sebagai Memenuhi Syarat (MS)?
            Pelamar akan dilanjutkan ke tahap selanjutnya.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Konfirmasi MS
          </button>
        </div>
      </div>
    </div>
  );
}

// Success Modal
function SuccessModal({ isOpen, onClose, status }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${status === "ms" ? "bg-green-100" : "bg-red-100"}`}>
              {status === "ms" ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Berhasil Disimpan
          </h3>
          <p className="text-gray-600 mb-6">
            Status lamaran telah diperbarui menjadi {status === "ms" ? "MS (Memenuhi Syarat)" : "TMS (Tidak Memenuhi Syarat)"}.
          </p>
          <button
            onClick={onClose}
            className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all w-full"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DetailLamaranPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id;
  const applicationData = dummyApplicationsData[applicationId];

  const [expandedDocuments, setExpandedDocuments] = useState({});
  const [isTMSModalOpen, setIsTMSModalOpen] = useState(false);
  const [isMSModalOpen, setIsMSModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successStatus, setSuccessStatus] = useState("");

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lamaran Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            ID lamaran yang Anda cari tidak ditemukan.
          </p>
          <Link
            href="/admin/lamaran"
            className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all inline-block"
          >
            Kembali ke Daftar Lamaran
          </Link>
        </div>
      </div>
    );
  }

  const toggleDocument = (docId) => {
    setExpandedDocuments((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleTMSSubmit = (reason) => {
    console.log("TMS Reason:", reason);
    setIsTMSModalOpen(false);
    setSuccessStatus("tms");
    setIsSuccessModalOpen(true);
    // Redirect after a short delay
    setTimeout(() => {
      router.push("/admin/lamaran");
    }, 1500);
  };

  const handleMSConfirm = () => {
    console.log("MS Confirmed");
    setIsMSModalOpen(false);
    setSuccessStatus("ms");
    setIsSuccessModalOpen(true);
    // Redirect after a short delay
    setTimeout(() => {
      router.push("/admin/lamaran");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/admin/lamaran"
            className="inline-block text-brand-blue hover:text-brand-blue/80 transition-colors mb-4"
          >
            ← Kembali ke Daftar Lamaran
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {applicationData.name}
              </h1>
              <p className="text-gray-600 mb-2">{applicationData.position}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>ID: {applicationData.id}</span>
                <span>•</span>
                <span>{applicationData.email}</span>
                <span>•</span>
                <span>{applicationData.phone}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Tanggal Pengajuan</div>
              <div className="font-semibold text-gray-900">
                {new Date(applicationData.submittedDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Documents Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dokumen yang Diajukan
            </h2>
            <div className="space-y-4">
              {applicationData.documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  isExpanded={expandedDocuments[document.id]}
                  onToggle={() => toggleDocument(document.id)}
                />
              ))}
            </div>
          </div>

          {/* Overall AI Recommendation */}
          <OverallAIRecommendation documents={applicationData.documents} />

          {/* Action Buttons */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Keputusan Verifikasi
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Berdasarkan dokumen yang telah diajukan dan analisis AI, berikan keputusan verifikasi Anda.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsTMSModalOpen(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5" />
                TMS (Tidak Memenuhi Syarat)
              </button>
              <button
                onClick={() => setIsMSModalOpen(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <ThumbsUp className="w-5 h-5" />
                MS (Memenuhi Syarat)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <TMSModal
        isOpen={isTMSModalOpen}
        onClose={() => setIsTMSModalOpen(false)}
        onSubmit={handleTMSSubmit}
      />
      <MSModal
        isOpen={isMSModalOpen}
        onClose={() => setIsMSModalOpen(false)}
        onConfirm={handleMSConfirm}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          router.push("/admin/lamaran");
        }}
        status={successStatus}
      />
    </div>
  );
}
