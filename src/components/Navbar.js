import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-brand-blue">
                SIVANA
              </div>
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
