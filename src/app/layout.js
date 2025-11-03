import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TanyaBKN from "@/components/TanyaBKN";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SIVANA",
  description: "Sistem Integritas dan Verifikasi ASN Nasional.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">SIVANA</h3>
            <p className="text-white/80 mb-6">
              Sistem Integritas dan Verifikasi ASN Nasional
            </p>
            <p className="text-white/60 text-sm">
              © 2025 Tim Makara - ASN Digital AI Hackathon
            </p>
          </div>
        </footer>
        <TanyaBKN />
      </body>
    </html>
  );
}
