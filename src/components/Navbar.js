"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import CobaSivanaModal from "./CobaSivanaModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine button text based on current page
  const buttonText = pathname === "/" ? "Coba Sekarang" : "Ganti Role";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-b border-[#239DD7]/20 shadow-lg">
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-cyan-50/30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Glow Effect */}
            <div className="flex items-center">
              <Link href="/" className="group relative flex items-center">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#239DD7] to-cyan-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <Image
                  src="/images/logo.png"
                  alt="SIVANA"
                  width={80}
                  height={40}
                  className="h-10 w-auto relative z-10 transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* CTA Button with Pink Gradient */}
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#DE1B5D] to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity"></div>

                {/* Button Content */}
                <div className="relative bg-gradient-to-r from-[#DE1B5D] to-pink-500 px-6 py-2.5 rounded-lg font-medium text-white transition-all group-hover:scale-105 shadow-lg">
                  <span className="relative z-10">{buttonText}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#239DD7] to-transparent opacity-30"></div>
      </nav>

      <CobaSivanaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
