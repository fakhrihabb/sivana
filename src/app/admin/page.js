"use client";

import { useState } from "react";
import { ScanFace, Users, MessageSquareWarning } from "lucide-react";
import Link from "next/link";

// Modal Component
function DalamPengembanganModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MessageSquareWarning className="w-16 h-16 text-brand-pink" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Dalam Pengembangan
          </h3>
          <p className="text-gray-600 mb-6">
            Maaf, fitur ini sedang dalam tahap pengembangan dan akan segera
            tersedia.
          </p>
          <button
            onClick={onClose}
            className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all w-full"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, onClick, href }) {
  const content = (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-brand-blue transition-all duration-300 cursor-pointer h-full flex flex-col">
      <div className="flex items-start gap-4 flex-grow">
        <div className="bg-brand-blue/10 p-3 rounded-lg">
          <Icon className="w-8 h-8 text-brand-blue" />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      icon: ScanFace,
      title: "Verifikasi Wajah",
      description:
        "Fitur verifikasi wajah berbasis CV untuk mencocokkan wajah peserta dengan database ID di lokasi ujian.",
      href: "/admin/verifikasi-wajah",
    },
    {
      icon: Users,
      title: "Lihat Data Pendaftar",
      description:
        "Kelola dan lihat data lengkap peserta yang telah mendaftar dalam sistem SSCASN.",
      onClick: () => setIsModalOpen(true),
    },
    {
      icon: MessageSquareWarning,
      title: "Lihat Keluhan Pengguna",
      description:
        "Monitor dan tanggapi keluhan serta masukan dari pengguna sistem.",
      onClick: () => setIsModalOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-block text-brand-blue hover:text-brand-pink transition-colors mb-4"
          >
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dashboard Admin
          </h1>
          <p className="text-lg text-gray-600">
            Kelola sistem SIVANA x SSCASN dengan mudah
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <DalamPengembanganModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
