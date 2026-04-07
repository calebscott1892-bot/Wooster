"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { CheckoutButton } from "@/components/CheckoutButton";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-wooster-black pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-[0.15em] text-white mb-8">
          YOUR CART
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-wooster-steel text-lg mb-6">
              Your cart is empty
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center justify-center px-8 py-3 bg-wooster-orange text-white font-[family-name:var(--font-display)] tracking-[0.15em] rounded hover:bg-wooster-orange-glow transition-colors"
            >
              BROWSE PRODUCTS
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant?.id || "default"}`}
                  className="flex gap-6 p-6 bg-wooster-charcoal border border-white/5 rounded-lg"
                >
                  <div className="w-24 h-24 bg-wooster-dark rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-wooster-steel font-[family-name:var(--font-mono)]">
                      IMG
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-white">
                      {item.product.name.toUpperCase()}
                    </h3>
                    {item.variant && (
                      <p className="text-sm text-wooster-steel">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="font-[family-name:var(--font-mono)] text-wooster-orange mt-2">
                      {formatPrice(item.product.price, item.product.currency)}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.variant?.id
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-wooster-dark rounded text-wooster-steel hover:text-white"
                        >
                          -
                        </button>
                        <span className="font-[family-name:var(--font-mono)] text-white w-8 text-center">
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
                          className="w-8 h-8 flex items-center justify-center bg-wooster-dark rounded text-wooster-steel hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.product.id, item.variant?.id)
                        }
                        className="text-sm text-wooster-steel hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="font-[family-name:var(--font-mono)] text-white text-lg">
                    {formatPrice(
                      item.product.price * item.quantity,
                      item.product.currency
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-wooster-charcoal border border-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <span className="text-wooster-steel uppercase tracking-wide">
                  Total
                </span>
                <span className="font-[family-name:var(--font-display)] text-3xl text-white tracking-wider">
                  {formatPrice(totalPrice, "AUD")}
                </span>
              </div>
              <CheckoutButton
                label="PROCEED TO CHECKOUT"
                className="w-full py-4 bg-wooster-orange text-white font-[family-name:var(--font-display)] text-xl tracking-[0.2em] rounded btn-glow hover:bg-wooster-orange-glow transition-colors"
              />
              <p className="text-xs text-wooster-steel text-center mt-3">
                Shipping calculated at checkout
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
