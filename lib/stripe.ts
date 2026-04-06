import type { CartItem } from "./cart";

export async function createCheckoutSession(items: CartItem[]) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        name: item.product.name + (item.variant ? ` - ${item.variant.name}` : ""),
        price: item.product.price,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  const { url } = await response.json();
  return url as string;
}
