"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ProductImage } from "./ProductImage";

const components = [
  {
    name: "Wooster Core Handle",
    description: "Precision 3D-printed PETG/ASA construction",
    position: "top-[10%] left-[15%]",
    side: "left",
  },
  {
    name: "Mounting Plates",
    description: "Signal Orange accent plates for secure board attachment",
    position: "top-[55%] left-[5%]",
    side: "left",
  },
  {
    name: "Mounting Clips",
    description: "Custom-designed retention clips",
    position: "bottom-[25%] left-[15%]",
    side: "left",
  },
  {
    name: "Stainless Bolts",
    description: "Marine-grade stainless steel hardware",
    position: "bottom-[20%] right-[15%]",
    side: "right",
  },
  {
    name: "Washers",
    description: "Precision-fit stainless steel washers",
    position: "top-[60%] right-[5%]",
    side: "right",
  },
] as const;

export function ExplodedView() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="system"
      ref={sectionRef}
      className="relative py-24 md:py-32 layer-lines"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wooster-orange/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-xs tracking-[0.4em] uppercase mb-4">
            The System
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl tracking-[0.1em] text-white">
            PRECISION IN EVERY DETAIL
          </h2>
          <p className="text-wooster-steel mt-4 max-w-2xl mx-auto">
            Every component precision-printed. Every detail engineered for
            performance.
          </p>
        </motion.div>

        {/* Exploded view layout */}
        <div className="relative">
          {/* Main product image - exploded/unboxed view */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mx-auto max-w-4xl"
          >
            <ProductImage
              src="/images/exploded-view.jpg"
              alt="Wooster Core system - all components laid out including handle, mounting plates, clips, bolts, and washers"
              width={1200}
              height={900}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 900px"
            />

            {/* Component annotations - desktop only */}
            <div className="hidden lg:block">
              {components.map((component, index) => (
                <motion.div
                  key={component.name}
                  initial={{ opacity: 0, x: component.side === "left" ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
                  className={`absolute ${component.position} group`}
                >
                  <div className="bg-wooster-black/80 backdrop-blur-sm border border-wooster-orange/30 rounded-lg px-4 py-2 whitespace-nowrap hover:border-wooster-orange/60 transition-colors">
                    <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-white">
                      {component.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-wooster-steel mt-0.5">
                      {component.description}
                    </p>
                  </div>
                  {/* Leader line + connector dot — points toward the product */}
                  {component.side === "left" ? (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                      <div className="w-10 h-px bg-gradient-to-r from-wooster-orange/70 to-wooster-orange/20" />
                      <div className="w-2 h-2 bg-wooster-orange rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)]" />
                    </div>
                  ) : (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 flex items-center">
                      <div className="w-2 h-2 bg-wooster-orange rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)]" />
                      <div className="w-10 h-px bg-gradient-to-l from-wooster-orange/70 to-wooster-orange/20" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mobile component list */}
          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {components.map((component, index) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-wooster-charcoal/50 rounded-lg border border-white/5"
              >
                <div className="w-2 h-2 bg-wooster-orange rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-white">
                    {component.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-wooster-steel mt-0.5">
                    {component.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "5+", label: "Components" },
            { value: "PETG/ASA", label: "Material" },
            { value: "316", label: "Steel Grade" },
            { value: "∞", label: "Sessions" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-wooster-charcoal/30 rounded-lg border border-white/5"
            >
              <p className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-wooster-orange tracking-wider">
                {stat.value}
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xs text-wooster-steel tracking-[0.2em] mt-2 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
