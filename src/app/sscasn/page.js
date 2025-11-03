import Hero from "@/components/Hero";
import DaftarFormasi from "@/components/DaftarFormasi";

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      <Hero />
      <div className="gradient-bg">
        <DaftarFormasi />
      </div>
    </div>
  );
}
