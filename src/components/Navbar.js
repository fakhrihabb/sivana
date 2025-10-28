"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar when user scrolls down more than 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
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
            <Link
              href="/admin"
              className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
