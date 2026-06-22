"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ProductImage } from "@/components/ProductImage";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-wooster-charcoal border-l border-white/5 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="font-[family-name:var(--font-display)] text-xl tracking-widest text-white">
                YOUR CART ({totalItems})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 text-wooster-steel hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-wooster-steel">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="mb-4 opacity-50"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant?.id || "default"}`}
                      className="flex gap-4 p-4 bg-wooster-black/50 rounded-lg border border-white/5"
                    >
                      {/* Product thumbnail */}
                      <div className="relative w-16 h-16 bg-wooster-dark rounded flex-shrink-0 overflow-hidden">
                        <ProductImage
                          src={item.product.image || ""}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          compactFallback
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-wooster-steel mt-0.5">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-wooster-orange font-[family-name:var(--font-mono)] mt-1">
                          {formatPrice(item.product.price, item.product.currency)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.variant?.id
                              )
                            }
                            aria-label="Decrease quantity"
                            className="w-6 h-6 flex items-center justify-center bg-wooster-dark border border-white/10 rounded text-wooster-steel hover:text-white hover:border-wooster-orange/40 text-xs transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-[family-name:var(--font-mono)] text-white min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.variant?.id
                              )
                            }
                            aria-label="Increase quantity"
                            className="w-6 h-6 flex items-center justify-center bg-wooster-dark border border-white/10 rounded text-wooster-steel hover:text-white hover:border-wooster-orange/40 text-xs transition-colors"
                          >
                            +
                          </button>
                          {item.quantity > 1 && (
                            <span className="ml-auto text-xs font-[family-name:var(--font-mono)] text-wooster-steel/60">
                              {formatPrice(
                                item.product.price * item.quantity,
                                item.product.currency
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.variant?.id)
                        }
                        className="text-wooster-steel hover:text-red-500 transition-colors self-start"
                        aria-label="Remove item"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-wooster-steel text-sm uppercase tracking-wide">
                    Total
                  </span>
                  <span className="text-xl font-[family-name:var(--font-display)] tracking-wider text-white">
                    {formatPrice(totalPrice, "AUD")}
                  </span>
                </div>
                <CheckoutButton
                  label="CHECKOUT"
                  className="w-full py-3 bg-wooster-orange text-white font-[family-name:var(--font-display)] text-lg tracking-widest rounded btn-glow hover:bg-wooster-orange-glow transition-colors"
                />
                <p className="text-xs text-wooster-steel text-center mt-3">
                  Shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
