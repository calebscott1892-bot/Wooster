import type { CartItem } from "./cart";

interface CheckoutSessionResponse {
  url?: string;
  error?: string;
}

export async function createCheckoutSession(items: CartItem[]) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
      })),
    }),
  });

  const payload = (await response.json()) as CheckoutSessionResponse;

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Failed to create checkout session");
  }

  return payload.url;
}
