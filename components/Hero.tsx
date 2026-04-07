"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ParticleBackground } from "./ParticleBackground";

const PrintAnimation3D = dynamic(() => import("./PrintAnimation3D"), {
  ssr: false,
  loading: () => null,
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState(false);
  const [textHovered, setTextHovered] = useState(false);
  const dragTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInteractStart = useCallback(() => {
    if (dragTimer.current) clearTimeout(dragTimer.current);
    setDragging(true);
  }, []);

  const handleInteractEnd = useCallback(() => {
    if (dragTimer.current) clearTimeout(dragTimer.current);
    dragTimer.current = setTimeout(() => setDragging(false), 400);
  }, []);

  useEffect(() => {
    // Dynamic import GSAP to avoid SSR issues
    async function initGSAP() {
      const gsap = (await import("gsap")).default;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title-wooster", {
        y: 80,
        opacity: 0,
        duration: 1,
        delay: 0.3,
      })
        .from(
          ".hero-title-core",
          {
            y: 80,
            opacity: 0,
            duration: 1,
          },
          "-=0.7"
        )
        .from(
          ".hero-tagline",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3"
        )
        .from(
          ".hero-badge",
          {
            opacity: 0,
            duration: 0.6,
          },
          "-=0.2"
        );
    }

    initGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-wooster-black via-wooster-dark to-wooster-black" />

      {/* Particle effect */}
      <ParticleBackground />

      {/* Radial glow — offset right to sit behind the 3D model */}
      <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-wooster-orange/5 rounded-full blur-[120px]" />

      {/* ── 3D Canvas Layer — fills entire hero, transparent background ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
      >
        <PrintAnimation3D
          onInteractStart={handleInteractStart}
          onInteractEnd={handleInteractEnd}
        />
      </motion.div>

      {/* ── Text Overlay — sits on top of canvas, pointer-events pass through ── */}
      <div
        className="absolute inset-0 z-20 pointer-events-none flex items-center"
      >
        <div
          className="max-w-[90rem] w-full mx-auto px-6 lg:px-12"
        >
          <div
            className="lg:max-w-[38%] text-center lg:text-left transition-opacity duration-300 pointer-events-auto"
            style={{ opacity: dragging && !textHovered ? 0.15 : 1 }}
            onMouseEnter={() => setTextHovered(true)}
            onMouseLeave={() => setTextHovered(false)}
          >
            <div className="overflow-hidden">
              <h1 className="font-[family-name:var(--font-display)] leading-none">
                <span className="hero-title-wooster block text-[clamp(3rem,10vw,7.5rem)] tracking-[0.15em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                  WOOSTER
                </span>
                <span className="hero-title-core block text-[clamp(3rem,10vw,7.5rem)] tracking-[0.15em] text-wooster-steel drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                  CORE
                </span>
              </h1>
            </div>

            <p className="hero-tagline font-[family-name:var(--font-mono)] text-wooster-orange text-sm md:text-base tracking-[0.3em] mt-4 uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Performance Big Air
            </p>

            <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pointer-events-auto">
              <a
                href="#products"
                className="inline-flex items-center justify-center px-8 py-4 bg-wooster-orange text-white font-[family-name:var(--font-display)] text-lg tracking-[0.2em] rounded btn-glow hover:bg-wooster-orange-glow transition-all"
              >
                SHOP NOW
              </a>
              <a
                href="#system"
                className="inline-flex items-center justify-center px-8 py-4 border border-wooster-steel/30 text-wooster-steel font-[family-name:var(--font-display)] text-lg tracking-[0.2em] rounded hover:border-wooster-orange hover:text-wooster-orange transition-all"
              >
                EXPLORE
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Engineered by badge — hidden on mobile to reduce clutter */}
      <div className="hero-badge absolute bottom-8 right-8 text-right z-20 pointer-events-none hidden lg:block">
        <p className="text-[10px] tracking-[0.3em] text-wooster-steel/50 uppercase">
          Engineered by
        </p>
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-wooster-steel/70">
          ARTY DESIGN
        </p>
      </div>
    </section>
  );
}
