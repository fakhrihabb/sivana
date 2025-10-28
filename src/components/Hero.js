import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-blue/5 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              SIVANA x SSCASN
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Sistem Informasi Verifikasi Administrasi Nasional untuk seleksi
              Aparatur Sipil Negara. Daftar sekarang dan raih kesempatan untuk
              mengabdi kepada negara.
            </p>
          </div>

          {/* Right side - Image */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-brand-pink/10 rounded-full blur-3xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Placeholder for hero image */}
                <div className="w-full h-full bg-gradient-to-br from-brand-blue to-brand-pink rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-48 h-48 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
