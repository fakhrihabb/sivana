import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DaftarFormasi from "@/components/DaftarFormasi";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DaftarFormasi />
      <Footer />
    </div>
  );
}
