import type { Metadata } from "next";
import { LandingNav } from "@/components/surfaces/landing/LandingNav";
import { HeroSection } from "@/components/surfaces/landing/HeroSection";

export const metadata: Metadata = {
  title: "KnowLattice — Intelligent Lesson Practice Application",
  description: "Test your knowledge, strengthen your understanding. Adaptive learning powered by AI knowledge graphs and spaced repetition.",
};

export default function LandingPage() {
  return (
    <main className="font-poppins">
      <LandingNav />
      <HeroSection />
    </main>
  );
}
