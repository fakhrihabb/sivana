"use client";

import { useState } from "react";
import { ScanFace, Users, MessageSquareWarning, ImagePlus } from "lucide-react";
import Link from "next/link";

// Modal Component
function DalamPengembanganModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-60 flex items-center justify-center p-4">
      <div className="group relative max-w-md w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

        {/* Modal Content */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#239DD7]/20">
          <div className="text-center">
            {/* Icon with animated background */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[#DE1B5D] to-pink-500 p-4 rounded-2xl shadow-lg">
                  <MessageSquareWarning className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent mb-4">
              Dalam Pengembangan
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Maaf, fitur ini sedang dalam tahap pengembangan dan akan segera
              tersedia.
            </p>

            {/* Pink gradient button */}
            <button
              onClick={onClose}
              className="group/btn relative w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-r from-[#DE1B5D] to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-500 group-hover/btn:scale-105 group-hover/btn:shadow-lg group-hover/btn:shadow-pink-500/30">
                <span className="group-hover/btn:scale-110 inline-block transition-transform duration-300">Tutup</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, onClick, href }) {
  const content = (
    <div className="group/card relative h-full">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-2xl blur opacity-0 group-hover/card:opacity-50 transition-opacity duration-500"></div>

      {/* Card Content */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-[#239DD7]/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer h-full flex flex-col hover:-translate-y-3 hover:scale-[1.02] hover:border-[#239DD7]/50">
        <div className="flex items-start gap-4 flex-grow">
          {/* Icon with pink gradient */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-xl blur opacity-30 group-hover/card:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-[#DE1B5D] to-pink-500 p-3 rounded-xl shadow-lg transform group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-500">
              <Icon className="w-8 h-8 text-white group-hover/card:scale-110 transition-transform duration-500" />
            </div>
          </div>

          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover/card:text-[#239DD7] group-hover/card:scale-[1.02] transition-all duration-300">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
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
      icon: ImagePlus,
      title: "Upload Foto Wajah",
      description:
        "Upload dan kelola foto wajah untuk database sistem verifikasi identitas peserta ujian.",
      href: "/admin/upload-wajah",
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
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 py-20 md:py-28 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* 3D Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(35, 157, 215, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(35, 157, 215, 0.15) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom'
          }}></div>

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#239DD7] rounded-full blur-[120px] opacity-20 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-[120px] opacity-15 animate-float" style={{animationDelay: '2s'}}></div>

          {/* Scan Lines */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#239DD7] to-transparent h-32 animate-[scan-line_4s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Link with hover effect */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[#239DD7] hover:text-[#DE1B5D] transition-all duration-300 mb-8 font-semibold hover:gap-3"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span className="group-hover:scale-105 transition-transform duration-300">Kembali ke Beranda</span>
          </Link>

          <div className="flex items-start justify-between gap-12">
            <div className="space-y-6 max-w-3xl flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:bg-white transition-all duration-500 cursor-default border border-[#239DD7]/20">
                <div className="w-2 h-2 bg-[#DE1B5D] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-[#239DD7]">Admin Dashboard</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-right">
                <span className="bg-gradient-to-r from-[#239DD7] via-cyan-500 to-[#DE1B5D] bg-clip-text text-transparent">
                  Dashboard Admin & Petugas SSCASN
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                Kelola sistem SIVANA x SSCASN dengan mudah. Verifikasi identitas, monitor pendaftar, dan kelola keluhan pengguna dalam satu platform terpadu.
              </p>
            </div>

            {/* Right Side Admin Icon */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#239DD7] via-cyan-500 to-[#DE1B5D] rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-float"></div>
                
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-[#239DD7] to-cyan-500 p-8 rounded-2xl shadow-2xl group-hover:shadow-3xl group-hover:shadow-blue-500/40 group-hover:border-[#239DD7] transition-all duration-500 group-hover:scale-105">
                  <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="gradient-bg min-h-[50vh] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full border border-[#239DD7]/20 text-sm font-mono text-[#239DD7] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-110 hover:border-[#DE1B5D]/70 hover:bg-white hover:text-[#DE1B5D] transition-all duration-500 cursor-default hover:rotate-2">
                FITUR ADMIN
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-gray-900 via-[#239DD7] to-gray-900 bg-clip-text text-transparent">
                Kelola Sistem SIVANA
              </span>
            </h2>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
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
