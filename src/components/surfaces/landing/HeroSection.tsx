"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── Content ────────────────────────────────────────────────────────────────
const HERO_TITLE_LINE1 = "Welcome to!";
const HERO_TITLE_LINE2 = "Intelligent Lesson Practice Application";
const HERO_SUBTITLE    = "Test your knowledge, strengthen your understanding.";
const CTA_LABEL        = "Get Started";
const CTA_HREF         = "/auth";

// ── Particle canvas constants ──────────────────────────────────────────────
const PARTICLE_COUNT        = 60;
const PARTICLE_MAX_DIST     = 140;
const PARTICLE_LINE_WIDTH   = 0.6;
const PARTICLE_LINE_ALPHA   = 0.35;
const PARTICLE_LINE_COLOR   = "rgba(160, 200, 230,";
const PARTICLE_FILL_COLOR   = "rgba(150, 195, 228, 0.75)";
const PARTICLE_SPEED        = 0.28;
const PARTICLE_MIN_RADIUS   = 1.0;
const PARTICLE_RADIUS_RANGE = 1.5;

// ── Book animation constants ───────────────────────────────────────────────
const BOOK_FLOAT_RANGE    = 7;
const BOOK_FLOAT_DURATION = 5;

// ── SVG stroke colors ──────────────────────────────────────────────────────
const BOOK_S  = "rgba(80,160,220,0.75)";
const BOOK_SL = "rgba(140,200,240,0.6)";
const BOOK_SS = "rgba(60,130,200,0.9)";

// ── Canvas Particle Animation ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const pts: P[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * W(),
      y:  Math.random() * H(),
      vx: (Math.random() - 0.5) * PARTICLE_SPEED,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED,
      r:  Math.random() * PARTICLE_RADIUS_RANGE + PARTICLE_MIN_RADIUS,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < PARTICLE_MAX_DIST) {
            const alpha = (1 - d / PARTICLE_MAX_DIST) * PARTICLE_LINE_ALPHA;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `${PARTICLE_LINE_COLOR} ${alpha})`;
            ctx.lineWidth   = PARTICLE_LINE_WIDTH;
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_FILL_COLOR;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
    />
  );
}

// ── Flowing SVG Wave Layers ────────────────────────────────────────────────
function FlowingWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden z-[1]">
      {/* Ambient radial glow base */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 70% at 40% 55%, #cce5f8 0%, #e8f4fd 55%, #ffffff 100%)" }}
      />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id="waveBlur1"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="waveBlur2"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="waveBlur3"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <path d="M -60 900 L -60 560 Q 80 460 220 500 Q 380 550 460 480 Q 560 400 700 440 Q 820 475 880 560 Q 940 640 860 720 Q 760 820 600 860 Q 400 910 200 900 Z"
          fill="#1565c0" opacity="0.82" filter="url(#waveBlur1)" />
        <path d="M -60 900 L -60 620 Q 100 520 280 560 Q 460 605 560 530 Q 680 445 820 490 Q 980 540 1040 640 Q 1100 740 980 820 Q 820 900 560 900 Z"
          fill="#1e88e5" opacity="0.70" filter="url(#waveBlur1)" />
        <path d="M -60 900 L -60 680 Q 120 580 340 610 Q 520 638 660 570 Q 800 500 960 540 Q 1120 580 1240 680 Q 1380 780 1440 860 L 1440 900 Z"
          fill="#42a5f5" opacity="0.58" filter="url(#waveBlur2)" />
        <path d="M -60 900 L -60 740 Q 160 650 380 670 Q 580 690 720 620 Q 880 545 1060 580 Q 1240 615 1380 710 L 1440 760 L 1440 900 Z"
          fill="#90caf9" opacity="0.48" filter="url(#waveBlur2)" />
        <path d="M 0 900 L 0 800 Q 200 730 420 745 Q 640 760 800 700 Q 960 638 1140 660 Q 1320 682 1440 760 L 1440 900 Z"
          fill="#bbdefb" opacity="0.40" filter="url(#waveBlur3)" />
        <path d="M 700 0 Q 1000 40 1200 120 Q 1380 200 1440 320 L 1440 0 Z"
          fill="white" opacity="0.65" />
      </svg>
    </div>
  );
}

// ── Open Book Wireframe SVG ────────────────────────────────────────────────
// Proper open book: two trapezoidal pages side-by-side, vertical center spine,
// horizontal page lines + diagonal triangulation on each page.
function CrystalBook() {
  const s  = BOOK_S;
  const sl = BOOK_SL;
  const ss = BOOK_SS;

  return (
    <svg width="180" height="110" viewBox="0 0 180 110" fill="none">

      {/* Ghost depth layers */}
      <g opacity="0.13" transform="translate(-6,7)">
        <path d="M 90,8 L 12,22 L 8,88 L 90,102 Z"   stroke={s} strokeWidth="1.0" fill="none"/>
        <path d="M 90,8 L 168,22 L 172,88 L 90,102 Z" stroke={s} strokeWidth="1.0" fill="none"/>
      </g>
      <g opacity="0.08" transform="translate(-12,13)">
        <path d="M 90,8 L 12,22 L 8,88 L 90,102 Z"   stroke={s} strokeWidth="0.8" fill="none"/>
        <path d="M 90,8 L 168,22 L 172,88 L 90,102 Z" stroke={s} strokeWidth="0.8" fill="none"/>
      </g>

      {/* Left page */}
      <path d="M 90,8 L 12,22 L 8,88 L 90,102 Z"
        fill="rgba(190,225,250,0.07)" stroke={s} strokeWidth="1.3" strokeLinejoin="round"/>

      {/* Right page */}
      <path d="M 90,8 L 168,22 L 172,88 L 90,102 Z"
        fill="rgba(190,225,250,0.05)" stroke={s} strokeWidth="1.3" strokeLinejoin="round"/>

      {/* Left horizontal ribs */}
      <line x1="90" y1="30" x2="10"  y2="38" stroke={sl} strokeWidth="0.8" opacity="0.65"/>
      <line x1="90" y1="50" x2="9"   y2="56" stroke={sl} strokeWidth="0.8" opacity="0.65"/>
      <line x1="90" y1="68" x2="9"   y2="72" stroke={sl} strokeWidth="0.8" opacity="0.60"/>
      <line x1="90" y1="84" x2="9"   y2="86" stroke={sl} strokeWidth="0.8" opacity="0.55"/>

      {/* Left diagonals */}
      <line x1="90"  y1="8"  x2="8"  y2="88"  stroke={sl} strokeWidth="0.7" opacity="0.50"/>
      <line x1="12"  y1="22" x2="90" y2="102" stroke={sl} strokeWidth="0.7" opacity="0.50"/>
      <line x1="9"   y1="56" x2="90" y2="8"   stroke={sl} strokeWidth="0.6" opacity="0.40"/>
      <line x1="9"   y1="56" x2="90" y2="102" stroke={sl} strokeWidth="0.6" opacity="0.40"/>
      <line x1="12"  y1="22" x2="9"  y2="72"  stroke={sl} strokeWidth="0.6" opacity="0.38"/>
      <line x1="10"  y1="38" x2="8"  y2="88"  stroke={sl} strokeWidth="0.6" opacity="0.35"/>

      {/* Right horizontal ribs */}
      <line x1="90" y1="30" x2="170" y2="38" stroke={sl} strokeWidth="0.8" opacity="0.65"/>
      <line x1="90" y1="50" x2="171" y2="56" stroke={sl} strokeWidth="0.8" opacity="0.65"/>
      <line x1="90" y1="68" x2="171" y2="72" stroke={sl} strokeWidth="0.8" opacity="0.60"/>
      <line x1="90" y1="84" x2="171" y2="86" stroke={sl} strokeWidth="0.8" opacity="0.55"/>

      {/* Right diagonals */}
      <line x1="90"  y1="8"  x2="172" y2="88"  stroke={sl} strokeWidth="0.7" opacity="0.50"/>
      <line x1="168" y1="22" x2="90"  y2="102" stroke={sl} strokeWidth="0.7" opacity="0.50"/>
      <line x1="171" y1="56" x2="90"  y2="8"   stroke={sl} strokeWidth="0.6" opacity="0.40"/>
      <line x1="171" y1="56" x2="90"  y2="102" stroke={sl} strokeWidth="0.6" opacity="0.40"/>
      <line x1="168" y1="22" x2="171" y2="72"  stroke={sl} strokeWidth="0.6" opacity="0.38"/>
      <line x1="170" y1="38" x2="172" y2="88"  stroke={sl} strokeWidth="0.6" opacity="0.35"/>

      {/* Center spine */}
      <line x1="90" y1="8" x2="90" y2="102" stroke={ss} strokeWidth="1.7"/>

      {/* Top arch */}
      <path d="M 12,22 Q 90,4 168,22" fill="none" stroke={sl} strokeWidth="0.9" opacity="0.6"/>
      {/* Bottom arch */}
      <path d="M 8,88 Q 90,106 172,88" fill="none" stroke={sl} strokeWidth="0.9" opacity="0.5"/>
    </svg>
  );
}

// ── Main Hero Section ──────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center pt-[60px] font-poppins"
    >
      {/* Wave background — z:1 */}
      <FlowingWaves />

      {/* Particle network — z:2 */}
      <ParticleCanvas />

      {/* Floating book — z:8 */}
      <motion.div
        animate={{ y: [-BOOK_FLOAT_RANGE, BOOK_FLOAT_RANGE, -BOOK_FLOAT_RANGE] }}
        transition={{ duration: BOOK_FLOAT_DURATION, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[14%] left-[62%] z-[8]"
        style={{ filter: "drop-shadow(0 6px 20px rgba(21,101,192,0.20))" }}
      >
        <CrystalBook />
      </motion.div>

      {/* Hero content — z:10 */}
      <div className="relative z-10 text-center max-w-[960px] px-8">

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-extrabold text-[#0d1c45] leading-[1.12] mb-4 tracking-tight"
          style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.8rem)" }}
        >
          {HERO_TITLE_LINE1}
          <br />
          {HERO_TITLE_LINE2}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="text-[1.05rem] text-[#2d4060] mb-10 font-normal"
        >
          {HERO_SUBTITLE}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <Link
            href={CTA_HREF}
            className="inline-block rounded-full font-bold text-[1.05rem] no-underline transition-[transform,box-shadow] duration-200 text-blue-700 bg-white border border-white/90"
            style={{
              padding: "14px 58px",
              boxShadow: "0 4px 28px rgba(0,0,0,0.13), 0 1px 6px rgba(0,0,0,0.07)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 36px rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 28px rgba(0,0,0,0.13), 0 1px 6px rgba(0,0,0,0.07)";
            }}
          >
            {CTA_LABEL}
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
