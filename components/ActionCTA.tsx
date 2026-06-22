"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function ActionCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-48 overflow-hidden"
    >
      {/* Background treatment */}
      <div className="absolute inset-0 bg-gradient-to-b from-wooster-black via-wooster-dark to-wooster-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wooster-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wooster-orange/30 to-transparent" />

      {/* Orange glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wooster-orange/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wooster-orange/3 rounded-full blur-[150px]" />

      {/* Outline-text marquee backdrop */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 right-0 -translate-y-1/2 overflow-hidden pointer-events-none"
      >
        <div className="marquee-track flex whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="text-outline font-[family-name:var(--font-display)] text-[10rem] md:text-[16rem] leading-none tracking-[0.05em] pr-16"
            >
              BIG AIR — SEND IT — GO HUGE —&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-xs tracking-[0.5em] uppercase mb-6">
            Are you ready?
          </p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-[family-name:var(--font-display)] text-5xl md:text-8xl lg:text-9xl tracking-[0.1em] leading-none"
        >
          <span className="text-white">PULL THE</span>
          <br />
          <span className="text-gradient-orange">TRIGGER</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-wooster-steel mt-8 text-lg max-w-xl mx-auto"
        >
          Precision-engineered. Rider-tested. Ready for your next session.
          Don&apos;t just ride &mdash; dominate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12"
        >
          <a
            href="#products"
            className="inline-flex items-center justify-center px-12 py-5 bg-wooster-orange text-white font-[family-name:var(--font-display)] text-xl tracking-[0.25em] rounded btn-glow hover:bg-wooster-orange-glow transition-all group"
          >
            SHOP NOW
            <svg
              className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
