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
      title: "Kelola Lamaran",
      description:
        "Lihat dan kelola data lamaran lengkap dari peserta yang telah mendaftar dalam sistem SSCASN.",
      href: "/admin/lamaran",
    },
    {
      icon: MessageSquareWarning,
      title: "Keluhan Pengguna",
      description:
        "Monitor dan tanggapi keluhan serta masukan yang diterima dari pengguna sistem.",
      onClick: () => setIsModalOpen(true),
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#239DD7] to-[#DE1B5D] text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href="/"
            className="inline-block text-white hover:text-white/80 transition-colors mb-6"
          >
            ← Kembali ke Beranda
          </Link>
          <div className="space-y-6 animate-slide-up max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Dashboard Admin
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Kelola sistem SIVANA x SSCASN dengan mudah. Verifikasi identitas, monitor pendaftar, dan kelola keluhan pengguna dalam satu platform terpadu.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <DalamPengembanganModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
