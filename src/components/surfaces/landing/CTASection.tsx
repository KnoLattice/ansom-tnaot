"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        background: "#f8faff",
        fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #bfdbfe",
            borderRadius: 28,
            padding: "4rem 3rem",
            boxShadow: "0 4px 32px rgba(0,131,239,0.08)",
          }}
        >
          <h2 style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}>
            Ready to accelerate your learning?
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#475569", marginBottom: "2rem", maxWidth: 480, margin: "0 auto 2rem" }}>
            Join thousands of learners who are mastering complex subjects faster with KnowLattice.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth"
              style={{
                padding: "13px 40px",
                backgroundColor: "#0083ef",
                color: "white",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,131,239,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
            >
              Start for free
            </Link>
            <Link
              href="/auth"
              style={{
                padding: "12px 36px",
                border: "2px solid #0083ef",
                color: "#0083ef",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                background: "white",
                transition: "all 0.2s",
              }}
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
