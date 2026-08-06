import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import Story from "@/components/Story";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Glow from "@/components/Glow";

export default function Home() {
  return (
    <main className="bg-[#050505] text-white overflow-x-hidden">
      <Glow />
      <Navbar />
      <Hero />
      <Collections />
      <Story />
      <Stats />
      <Testimonials />
      <Footer />
    </main>
  );
}