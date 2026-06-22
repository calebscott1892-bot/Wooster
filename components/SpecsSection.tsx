"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ProductImage } from "./ProductImage";

const specs = [
  { label: "CONSTRUCTION", value: "3D Printed Precision" },
  { label: "PRIMARY MATERIAL", value: "PETG / ASA Polymer" },
  { label: "HARDWARE", value: "316 Stainless Steel" },
  { label: "FINISH", value: "Matte Black" },
  { label: "COMPATIBILITY", value: "Universal Kite Bar" },
  { label: "WOO MOUNT", value: "Integrated System" },
  { label: "TESTED", value: "Real-World Conditions" },
  { label: "ORIGIN", value: "Engineered in Australia" },
];

const materials = [
  {
    name: "PETG/ASA",
    description:
      "High-impact polymer blend offering exceptional durability, UV resistance, and chemical resistance. Engineered to withstand saltwater environments.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-8 h-8"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "Stainless Steel",
    description:
      "Marine-grade 316 stainless steel bolts and washers. Corrosion-resistant hardware built to last in the harshest ocean conditions.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-8 h-8"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    name: "3D Printed",
    description:
      "Layer-by-layer precision manufacturing allows for complex geometries impossible with traditional methods. Every handle is printed to exact specifications.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-8 h-8"
      >
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 2v20" />
        <path d="M17 2v20" />
        <path d="M2 12h20" />
        <path d="M2 7h20" />
        <path d="M2 17h20" />
      </svg>
    ),
  },
];

export function SpecsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="specs" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-xs tracking-[0.4em] uppercase mb-4">
            Technical Specifications
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl tracking-[0.1em] text-white">
            BUILT TO PERFORM
          </h2>
        </motion.div>

        {/* Split layout: Image + Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Product Detail Shot */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <ProductImage
              src="/images/product-detail.jpg"
              alt="Wooster Core handle close-up detail showing 3D printed layer lines and precision construction"
              width={700}
              height={525}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 rounded-lg ring-1 ring-white/5" />
            {/* Engineering corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-wooster-orange/60" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-wooster-orange/60" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-wooster-orange/60" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-wooster-orange/60" />
            <span className="absolute bottom-6 left-6 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[9px] font-[family-name:var(--font-mono)] tracking-[0.25em] text-wooster-silver/80 uppercase">
              Actual Print — 0.2mm Layers
            </span>
          </motion.div>

          {/* Specs Table */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="space-y-0">
              {specs.map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                  className="flex items-center justify-between py-4 border-b border-white/5 group hover:border-wooster-orange/20 hover:bg-wooster-orange/[0.03] transition-colors px-2 -mx-2"
                >
                  <span className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-wooster-steel/60 uppercase">
                    <span className="text-wooster-orange/40 mr-3">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {spec.label}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] text-sm text-wooster-orange group-hover:text-wooster-orange-glow transition-colors">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Material Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {materials.map((material, index) => (
            <motion.div
              key={material.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 + index * 0.15 }}
              className="p-6 bg-wooster-charcoal/40 border border-white/5 rounded-xl hover:border-wooster-orange/20 transition-all group"
            >
              <div className="text-wooster-orange mb-4 group-hover:text-wooster-orange-glow transition-colors">
                {material.icon}
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.1em] text-white">
                {material.name.toUpperCase()}
              </h3>
              <p className="text-sm text-wooster-steel mt-2 leading-relaxed">
                {material.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
