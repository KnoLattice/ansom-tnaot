"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "10,000+", label: "Concepts Learned" },
  { value: "95%", label: "Retention Rate" },
  { value: "3×", label: "Faster Mastery" },
  { value: "500+", label: "Active Learners" },
];

export function StatsSection() {
  return (
    <section
      style={{
        padding: "5rem 1.5rem",
        background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
        fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle wave overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <div style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.03em",
                marginBottom: "0.4rem",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "0.9rem",
                color: "#bfdbfe",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
