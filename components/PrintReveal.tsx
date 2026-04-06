"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

export function PrintReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [revealPercent, setRevealPercent] = useState(0);
  const [printComplete, setPrintComplete] = useState(false);
  const [showGCode, setShowGCode] = useState(true);

  useEffect(() => {
    if (!isInView) return;

    // Small delay before print starts
    const startDelay = setTimeout(() => {
      const startTime = Date.now();
      const duration = 4000; // 4 seconds total print

      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out curve to simulate print slowing at top
        const eased = 1 - Math.pow(1 - progress, 2.5);
        setRevealPercent(eased * 100);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setPrintComplete(true);
          setTimeout(() => setShowGCode(false), 800);
        }
      }

      requestAnimationFrame(animate);
    }, 600);

    return () => clearTimeout(startDelay);
  }, [isInView]);

  // G-code style status lines
  const gcodeLines = [
    "G28 ; Home all axes",
    "M104 S245 ; Set nozzle temp",
    "M190 S70 ; Wait bed temp",
    "G1 Z0.2 F1200 ; First layer",
    `G1 E${(revealPercent * 2.4).toFixed(1)} ; Extruding...`,
    `; Layer ${Math.floor(revealPercent * 3.2)}/320`,
    `; Z${(revealPercent * 0.32).toFixed(1)}mm`,
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* G-code readout - top left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showGCode && isInView ? 0.7 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute -top-2 -left-2 z-20 pointer-events-none select-none hidden lg:block"
      >
        <div className="font-[family-name:var(--font-mono)] text-[10px] leading-tight text-wooster-orange/60 space-y-0.5">
          {gcodeLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Print progress indicator - right side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -right-8 md:-right-12 top-0 bottom-0 z-20 hidden lg:flex flex-col items-center justify-end"
      >
        <div className="relative h-full w-px bg-white/5">
          {/* Progress fill */}
          <div
            className="absolute bottom-0 left-0 w-px bg-gradient-to-t from-wooster-orange to-wooster-orange/30 transition-all duration-100"
            style={{ height: `${revealPercent}%` }}
          />
          {/* Current position indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-100"
            style={{ bottom: `${revealPercent}%` }}
          >
            <div className="w-2 h-2 bg-wooster-orange rounded-full shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
          </div>
          {/* Percentage label */}
          <div
            className="absolute -right-1 translate-x-full transition-all duration-100"
            style={{ bottom: `${revealPercent}%` }}
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-wooster-orange ml-2">
              {Math.floor(revealPercent)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Build plate base */}
      <div className="relative">
        {/* Build plate surface */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%] z-10">
          <div className="h-1.5 bg-gradient-to-r from-transparent via-wooster-steel/20 to-transparent rounded-full" />
          <div className="h-6 bg-gradient-to-b from-wooster-charcoal/60 to-transparent rounded-b-lg mx-4 border-x border-b border-white/5" />
        </div>

        {/* The print container */}
        <div className="relative overflow-hidden rounded-lg">
          {/* Layer line overlay - horizontal lines simulating FDM print layers */}
          <div
            className="absolute inset-0 z-10 pointer-events-none print-layer-overlay"
            style={{
              opacity: printComplete ? 0 : 0.35,
              transition: "opacity 1.5s ease",
            }}
          />

          {/* Glowing print edge - the "hot" layer being printed */}
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none h-1 transition-all duration-100"
            style={{
              bottom: `${revealPercent}%`,
              opacity: printComplete ? 0 : 1,
              background:
                "linear-gradient(to right, transparent, rgba(255,107,0,0.8) 20%, rgba(255,107,0,1) 50%, rgba(255,107,0,0.8) 80%, transparent)",
              boxShadow: "0 0 20px 5px rgba(255,107,0,0.4), 0 0 60px 10px rgba(255,107,0,0.15)",
              transition: printComplete
                ? "opacity 1s ease"
                : "bottom 0.1s linear",
            }}
          />

          {/* Nozzle / print head indicator */}
          {!printComplete && revealPercent > 0 && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-100"
              style={{
                bottom: `${revealPercent}%`,
                left: `${50 + Math.sin(revealPercent * 0.3) * 30}%`,
                transform: "translate(-50%, 50%)",
              }}
            >
              {/* Nozzle body */}
              <div className="relative">
                <div className="w-3 h-5 bg-wooster-steel/60 rounded-t border border-white/10 mx-auto" />
                <div className="w-1.5 h-1 bg-wooster-orange mx-auto rounded-b shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
              </div>
            </div>
          )}

          {/* Clip mask — reveals image from bottom to top */}
          <div
            className="transition-all duration-100"
            style={{
              clipPath: `inset(${100 - revealPercent}% 0 0 0)`,
            }}
          >
            <Image
              src="/images/hero-product.jpg"
              alt="Wooster Core performance kitesurfing handle - precision 3D printed in matte black with stainless steel hardware"
              width={700}
              height={525}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* Translucent "ghost" preview of what's coming */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: `inset(0 0 ${revealPercent}% 0)`,
              opacity: printComplete ? 0 : 0.06,
              transition: printComplete ? "opacity 1s ease" : undefined,
            }}
          >
            <Image
              src="/images/hero-product.jpg"
              alt=""
              width={700}
              height={525}
              className="w-full h-auto"
              aria-hidden="true"
            />
          </div>

          {/* Scanline sweep effect during printing */}
          {!printComplete && revealPercent > 0 && (
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none transition-all duration-100"
              style={{
                bottom: `${Math.max(0, revealPercent - 8)}%`,
                height: "8%",
                background:
                  "linear-gradient(to top, transparent, rgba(255,107,0,0.03))",
              }}
            />
          )}
        </div>

        {/* Print complete flash */}
        {printComplete && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-10 pointer-events-none rounded-lg"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,107,0,0.15), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Status bar below the print */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] text-wooster-steel/40 uppercase"
      >
        <span>
          {printComplete ? (
            <span className="text-wooster-orange/70">Print Complete</span>
          ) : revealPercent > 0 ? (
            "Printing..."
          ) : (
            "Initialising..."
          )}
        </span>
        <span>
          {printComplete
            ? "PETG/ASA — 245°C"
            : `Layer ${Math.floor(revealPercent * 3.2)} / 320`}
        </span>
      </motion.div>
    </div>
  );
}
