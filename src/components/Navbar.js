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
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="SIVANA"
                  width={80}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CobaSivanaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
