"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { createCheckoutSession } from "@/lib/stripe";

interface CheckoutButtonProps {
  className: string;
  label: string;
}

export function CheckoutButton({
  className,
  label,
}: CheckoutButtonProps) {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = await createCheckoutSession(items);
      window.location.assign(url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout is unavailable right now."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={items.length === 0 || isLoading}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isLoading ? "REDIRECTING..." : label}
      </button>
      {error ? (
        <p className="mt-3 text-center text-xs text-red-400">{error}</p>
      ) : null}
    </>
  );
}