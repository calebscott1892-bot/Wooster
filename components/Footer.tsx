"use client";

import { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic TBD
    setEmail("");
  };

  return (
    <footer className="relative border-t border-white/5 bg-wooster-charcoal/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-[family-name:var(--font-display)] text-2xl tracking-[0.2em] text-white">
                WOOSTER
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl tracking-[0.2em] text-wooster-steel ml-2">
                CORE
              </span>
            </Link>
            <p className="text-sm text-wooster-steel mt-4 leading-relaxed">
              Precision 3D-printed performance kitesurfing handles. Engineered
              by Arty Design.
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/arty_dsgn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wooster-steel hover:text-wooster-orange transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-white mb-4">
              PRODUCTS
            </h4>
            <ul className="space-y-2">
              {[
                "Wooster Core",
                "Woo Mount",
                "Standalone Mount",
                "Ultimate Bundle",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#products"
                    className="text-sm text-wooster-steel hover:text-wooster-orange transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-white mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Arty Design", href: "#" },
                { name: "Jewellery Store", href: "#", badge: "Coming Soon" },
                { name: "Services", href: "#", badge: "Coming Soon" },
                { name: "Contact", href: "#" },
              ].map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <a
                    href={item.href}
                    className="text-sm text-wooster-steel hover:text-wooster-orange transition-colors"
                  >
                    {item.name}
                  </a>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-wooster-dark border border-white/10 rounded text-wooster-steel/60">
                      {item.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-white mb-4">
              STAY IN THE LOOP
            </h4>
            <p className="text-sm text-wooster-steel mb-4">
              Get updates on new products, drops, and rider content.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 bg-wooster-dark border border-white/10 rounded text-sm text-white placeholder:text-wooster-steel/40 focus:outline-none focus:border-wooster-orange/50 transition-colors"
                required
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-wooster-orange text-white text-sm font-[family-name:var(--font-display)] tracking-wider rounded hover:bg-wooster-orange-glow transition-colors"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-wooster-steel/50">
            &copy; {new Date().getFullYear()} Arty Design. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-wooster-steel/30 tracking-wider uppercase">
              Engineered by
            </span>
            <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.15em] text-wooster-steel/50">
              ARTY DESIGN
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
