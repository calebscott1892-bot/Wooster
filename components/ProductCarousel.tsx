"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ProductImage } from "./ProductImage";
import {
  products,
  bundles,
  bundleProducts,
  formatPrice,
  getBundleSavings,
} from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { addItem } = useCart();

  return (
    <section id="products" ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-xs tracking-[0.4em] uppercase mb-4">
            Product Lineup
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl tracking-[0.1em] text-white">
            CHOOSE YOUR WEAPON
          </h2>
        </motion.div>

        {/* Products Grid - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
          {products
            .filter((p) => p.status === "available")
            .map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isInView={isInView}
              />
            ))}
        </div>

        {/* Bundle */}
        {bundles.map((bundle) => {
          const savings = getBundleSavings(bundle);
          const purchasable = bundleProducts.find((p) => p.id === bundle.id);
          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 p-6 md:p-8 bg-gradient-to-r from-wooster-charcoal to-wooster-dark border border-wooster-orange/20 rounded-xl relative overflow-hidden group hover:border-wooster-orange/40 transition-colors duration-500"
            >
              {/* Corner glow accent */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-wooster-orange/10 rounded-full blur-[80px] group-hover:bg-wooster-orange/15 transition-colors duration-700" />

              <div className="absolute top-0 right-0 px-4 py-1 bg-wooster-orange text-white text-xs font-[family-name:var(--font-display)] tracking-[0.2em]">
                BEST VALUE
              </div>
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.25em] text-wooster-steel/50 uppercase">
                    WC-BNDL — Complete System
                  </p>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.1em] text-white mt-1">
                    {bundle.name.toUpperCase()}
                  </h3>
                  <p className="text-wooster-steel mt-2">{bundle.description}</p>
                  <div className="flex items-baseline gap-3 mt-4 justify-center md:justify-start">
                    <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-2xl">
                      {formatPrice(bundle.price, bundle.currency)}
                    </p>
                    {savings > 0 && (
                      <>
                        <p className="font-[family-name:var(--font-mono)] text-wooster-steel/40 line-through">
                          {formatPrice(bundle.price + savings, bundle.currency)}
                        </p>
                        <span className="px-2 py-0.5 bg-wooster-orange/15 border border-wooster-orange/30 rounded text-wooster-orange text-[10px] font-[family-name:var(--font-mono)] tracking-[0.15em]">
                          SAVE {formatPrice(savings, bundle.currency)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => purchasable && addItem(purchasable)}
                  className="relative px-8 py-4 bg-wooster-orange text-white font-[family-name:var(--font-display)] text-lg tracking-[0.2em] rounded btn-glow hover:bg-wooster-orange-glow transition-all whitespace-nowrap"
                >
                  ADD BUNDLE
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Coming Soon */}
        <div className="mt-16">
          <p className="font-[family-name:var(--font-mono)] text-wooster-steel/50 text-xs tracking-[0.4em] uppercase text-center mb-8">
            Coming Soon
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products
              .filter((p) => p.status === "coming_soon")
              .map((product) => (
                <div
                  key={product.id}
                  className="relative p-5 bg-wooster-charcoal/30 border border-white/5 rounded-lg opacity-60 hover:opacity-90 transition-opacity overflow-hidden"
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 border border-white/10 rounded text-[9px] font-[family-name:var(--font-mono)] tracking-[0.2em] text-wooster-steel/50">
                    TBA
                  </span>
                  <h4 className="font-[family-name:var(--font-display)] text-lg tracking-[0.1em] text-wooster-steel">
                    {product.name.toUpperCase()}
                  </h4>
                  <p className="text-sm text-wooster-steel/60 mt-1">
                    {product.tagline}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  index,
  isInView,
}: {
  product: (typeof products)[number];
  index: number;
  isInView: boolean;
}) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const selectedVariant = product.variants?.find((v) => v.id === variantId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="min-w-[300px] md:min-w-0 snap-center bg-wooster-charcoal border border-white/5 rounded-xl overflow-hidden group hover:border-wooster-orange/30 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(255,107,0,0.15)] transition-all duration-500 flex flex-col"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-wooster-dark overflow-hidden">
        <ProductImage
          src={product.image || "/images/placeholder.jpg"}
          alt={`${product.name} - ${product.tagline}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 300px, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wooster-charcoal/80 to-transparent" />
        {/* Stock + SKU chips */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[9px] font-[family-name:var(--font-mono)] tracking-[0.2em] text-wooster-silver">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            IN STOCK
          </span>
          {product.sku && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[9px] font-[family-name:var(--font-mono)] tracking-[0.2em] text-wooster-steel/70">
              {product.sku}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-white">
          {product.name.toUpperCase()}
        </h3>
        <p className="text-sm text-wooster-steel mt-1">{product.tagline}</p>
        <p className="text-sm text-wooster-steel/70 mt-3 line-clamp-2">
          {product.description}
        </p>

        {/* What's included */}
        {product.includes && product.includes.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {product.includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-wooster-steel/70"
              >
                <svg
                  className="w-3 h-3 mt-0.5 text-wooster-orange flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Variant selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setVariantId(variant.id)}
                aria-label={`Select ${variant.name}`}
                aria-pressed={variantId === variant.id}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  variantId === variant.id
                    ? "border-wooster-orange scale-110"
                    : "border-white/20 hover:border-wooster-orange/60"
                }`}
                style={{ backgroundColor: variant.color }}
                title={variant.name}
              />
            ))}
            {selectedVariant && (
              <span className="ml-1 text-[10px] font-[family-name:var(--font-mono)] tracking-[0.15em] text-wooster-steel/60 uppercase">
                {selectedVariant.name}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-6">
          <span className="font-[family-name:var(--font-mono)] text-wooster-orange text-xl">
            {formatPrice(product.price, product.currency)}
          </span>
          <button
            onClick={() => addItem(product, selectedVariant ?? product.variants?.[0])}
            className="px-5 py-2.5 bg-wooster-orange/10 border border-wooster-orange/30 text-wooster-orange text-sm font-[family-name:var(--font-display)] tracking-[0.15em] rounded hover:bg-wooster-orange hover:text-white transition-all"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </motion.div>
  );
}
