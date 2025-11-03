"use client";

import { useState } from "react";
import { Search, FileText, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

// Dummy data for applications
const dummyApplications = [
  {
    id: "LAM001",
    name: "Budi Santoso",
    position: "Analis Kebijakan Ahli Pertama",
    submittedDate: "2024-01-15",
    status: "belum_verifikasi",
    documents: 6,
  },
  {
    id: "LAM002",
    name: "Siti Nurhaliza",
    position: "Auditor Ahli Pertama",
    submittedDate: "2024-01-14",
    status: "belum_verifikasi",
    documents: 6,
  },
  {
    id: "LAM003",
    name: "Ahmad Wijaya",
    position: "Analis Data dan Informasi",
    submittedDate: "2024-01-13",
    status: "ms",
    documents: 6,
  },
  {
    id: "LAM004",
    name: "Dewi Lestari",
    position: "Pranata Komputer Ahli Pertama",
    submittedDate: "2024-01-12",
    status: "tms",
    documents: 6,
  },
  {
    id: "LAM005",
    name: "Rizki Pratama",
    position: "Analis Kebijakan Ahli Pertama",
    submittedDate: "2024-01-11",
    status: "belum_verifikasi",
    documents: 6,
  },
  {
    id: "LAM006",
    name: "Maya Kusuma",
    position: "Auditor Ahli Pertama",
    submittedDate: "2024-01-10",
    status: "ms",
    documents: 6,
  },
  {
    id: "LAM007",
    name: "Agus Setiawan",
    position: "Analis Keuangan",
    submittedDate: "2024-01-09",
    status: "tms",
    documents: 6,
  },
  {
    id: "LAM008",
    name: "Rina Marlina",
    position: "Pranata Komputer Ahli Pertama",
    submittedDate: "2024-01-08",
    status: "belum_verifikasi",
    documents: 6,
  },
];

// Status configuration
const statusConfig = {
  belum_verifikasi: {
    label: "Belum Verifikasi",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  tms: {
    label: "TMS",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
  ms: {
    label: "MS",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
};

// Application Card Component
function ApplicationCard({ application }) {
  const config = statusConfig[application.status];

  return (
    <Link href={`/admin/lamaran/${application.id}`}>
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-brand-blue transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-grow">
            <div className="bg-brand-blue/10 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} whitespace-nowrap`}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{application.position}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                <span>ID: {application.id}</span>
                <span>•</span>
                <span>Tanggal: {new Date(application.submittedDate).toLocaleDateString("id-ID")}</span>
                <span>•</span>
                <span>{application.documents} Dokumen</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

export default function KelolaLamaranPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("belum_verifikasi");

  // Filter applications
  const filteredApplications = dummyApplications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const counts = {
    belum_verifikasi: dummyApplications.filter((app) => app.status === "belum_verifikasi").length,
    tms: dummyApplications.filter((app) => app.status === "tms").length,
    ms: dummyApplications.filter((app) => app.status === "ms").length,
  };

  return (
    <div className="min-h-screen gradient-bg pt-16">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/admin"
            className="inline-block text-brand-blue hover:text-brand-blue/80 transition-colors mb-4"
          >
            ← Kembali ke Dashboard Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Lamaran
          </h1>
          <p className="text-gray-600">
            Kelola dan verifikasi lamaran peserta yang telah mendaftar dalam sistem SSCASN.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, ID lamaran, atau posisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-blue focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedStatus("belum_verifikasi")}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedStatus === "belum_verifikasi"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-500"
              }`}
            >
              Belum Verifikasi ({counts.belum_verifikasi})
            </button>
            <button
              onClick={() => setSelectedStatus("tms")}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedStatus === "tms"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-red-500"
              }`}
            >
              TMS ({counts.tms})
            </button>
            <button
              onClick={() => setSelectedStatus("ms")}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedStatus === "ms"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500"
              }`}
            >
              MS ({counts.ms})
            </button>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Lamaran
              </h3>
              <p className="text-gray-600">
                Tidak ada lamaran yang sesuai dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
