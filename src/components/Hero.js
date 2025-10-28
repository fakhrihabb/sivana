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
                <Image
                  src="/images/hero-image.png"
                  alt="SIVANA x SSCASN"
                  width={500}
                  height={500}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
