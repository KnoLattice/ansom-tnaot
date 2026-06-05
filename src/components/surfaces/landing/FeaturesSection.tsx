"use client";

import { motion } from "framer-motion";
import { Brain, BarChart2, BookOpen, Zap, Target, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    color: "#0083ef",
    bg: "#eff6ff",
    title: "Adaptive Learning",
    description: "Our AI adjusts question difficulty based on your mastery level, ensuring optimal learning progression.",
  },
  {
    icon: BarChart2,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    title: "Mastery Tracking",
    description: "Visualize your knowledge graph and track mastery across all concepts with detailed analytics.",
  },
  {
    icon: BookOpen,
    color: "#10b981",
    bg: "#ecfdf5",
    title: "Document Upload",
    description: "Upload any PDF or text file. Our AI extracts key concepts and builds a personalized study plan.",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    bg: "#fffbeb",
    title: "Spaced Repetition",
    description: "Smart scheduling surfaces weak concepts at the right time to maximize long-term retention.",
  },
  {
    icon: Target,
    color: "#ef4444",
    bg: "#fef2f2",
    title: "Targeted Practice",
    description: "Focus sessions zero in on your weakest areas so every study minute delivers maximum value.",
  },
  {
    icon: ShieldCheck,
    color: "#0ea5e9",
    bg: "#f0f9ff",
    title: "Knowledge Graph",
    description: "See how concepts interconnect in a beautiful interactive graph of your entire knowledge domain.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: "6rem 1.5rem",
        background: "white",
        fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <span style={{
            display: "inline-block",
            padding: "4px 16px",
            backgroundColor: "#eff6ff",
            color: "#0083ef",
            borderRadius: 999,
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Features
          </span>
          <h2 style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}>
            Everything you need to master any subject
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#64748b", maxWidth: 560, margin: "0 auto" }}>
            KnowLattice combines AI, spaced repetition, and knowledge graphs to help you learn faster and retain more.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
              style={{
                background: "white",
                border: "1px solid #f1f5f9",
                borderRadius: 20,
                padding: "1.75rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.25s, transform 0.25s",
                cursor: "default",
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                backgroundColor: f.bg,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.1rem",
              }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.65 }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
