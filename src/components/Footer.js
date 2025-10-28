export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-brand-blue mb-4">SIVANA</h3>
            <p className="text-gray-400 text-sm">
              Sistem Informasi Verifikasi Administrasi Nasional untuk seleksi
              Aparatur Sipil Negara Indonesia.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="font-semibold mb-4">Tautan Penting</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-brand-blue transition-colors">
                  Tentang SSCASN
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-blue transition-colors">
                  Panduan Pendaftaran
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-blue transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-blue transition-colors">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@sivana.go.id</li>
              <li>Telepon: (021) 1234-5678</li>
              <li>Senin - Jumat: 08:00 - 16:00 WIB</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {currentYear} SIVANA x SSCASN. Hak Cipta Dilindungi
            Undang-Undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
