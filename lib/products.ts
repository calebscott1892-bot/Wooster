export type ProductStatus = "available" | "coming_soon";

export interface ProductVariant {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  status: ProductStatus;
  sku?: string;
  material?: string;
  includes?: string[];
  variants?: ProductVariant[];
  image?: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  includes: string[];
  price: number;
  currency: string;
  image?: string;
}

export const products: Product[] = [
  {
    id: "wooster-core",
    name: "Wooster Core",
    tagline: "The Original Performance Handle",
    description:
      "Precision 3D-printed kitesurfing handle engineered for maximum grip and control during big air sessions. Tested by riders, refined through months of real-world feedback.",
    price: 149,
    currency: "AUD",
    status: "available",
    sku: "WC-100",
    material: "PETG/ASA",
    includes: [
      "Wooster Core Handle",
      "Mounting hardware (stainless steel bolts & washers)",
      "Mounting clips",
    ],
    variants: [
      { id: "core-black", name: "Stealth Black", color: "#1A1A1A" },
    ],
    image: "/images/product-core.jpg",
  },
  {
    id: "woo-mount",
    name: "Woo Mount Add-on",
    tagline: "Dedicated WOO Sensor Integration",
    description:
      "Seamlessly mount your WOO sensor to your Wooster Core handle. Precision-fit, secure attachment for accurate jump tracking.",
    price: 49,
    currency: "AUD",
    status: "available",
    sku: "WC-200",
    variants: [
      { id: "mount-black", name: "Stealth Black", color: "#1A1A1A" },
      { id: "mount-orange", name: "Signal Orange", color: "#FF6B00" },
    ],
    image: "/images/product-mount.jpg",
  },
  {
    id: "standalone-woo-mount",
    name: "Standalone Woo Mount",
    tagline: "Universal WOO Sensor Mount",
    description:
      "Mount your WOO sensor independently. Compatible with a range of board setups.",
    price: 59,
    currency: "AUD",
    status: "available",
    sku: "WC-250",
    image: "/images/product-standalone.jpg",
  },
  {
    id: "wooster-lite",
    name: "Wooster Lite",
    tagline: "Lighter. Faster. Freer.",
    description:
      "Lightweight construction for riders who want minimal weight without compromising performance.",
    price: 0,
    currency: "AUD",
    status: "coming_soon",
  },
  {
    id: "wooster-carbon",
    name: "Wooster Carbon",
    tagline: "Carbon Fibre Performance",
    description:
      "The ultimate construction. Carbon fibre composite for maximum strength-to-weight ratio.",
    price: 0,
    currency: "AUD",
    status: "coming_soon",
  },
  {
    id: "wooster-xl",
    name: "Wooster XL",
    tagline: "Go Bigger",
    description:
      "Extended handle for riders who want more grip surface and leverage.",
    price: 0,
    currency: "AUD",
    status: "coming_soon",
  },
];

export const bundles: Bundle[] = [
  {
    id: "ultimate-bundle",
    name: "Ultimate Bundle",
    description: "1x Wooster Core Handle + 1x Wooster System Woo Mount",
    includes: ["wooster-core", "woo-mount"],
    price: 179,
    currency: "AUD",
    image: "/images/bundle-ultimate.jpg",
  },
];

// Bundles represented as purchasable products so the cart and checkout
// can treat them like any other line item (at the bundle price).
export const bundleProducts: Product[] = bundles.map((bundle) => ({
  id: bundle.id,
  name: bundle.name,
  tagline: "Complete System",
  description: bundle.description,
  price: bundle.price,
  currency: bundle.currency,
  status: "available",
  sku: "WC-BNDL",
  includes: bundle.includes
    .map((id) => products.find((p) => p.id === id)?.name)
    .filter((name): name is string => Boolean(name)),
  image: bundle.image,
}));

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Anything that can be bought — catalog products plus bundles. */
export function getPurchasable(id: string): Product | undefined {
  return getProduct(id) ?? bundleProducts.find((p) => p.id === id);
}

/** Combined value of a bundle's contents minus the bundle price. */
export function getBundleSavings(bundle: Bundle): number {
  const value = bundle.includes.reduce(
    (sum, id) => sum + (products.find((p) => p.id === id)?.price ?? 0),
    0
  );
  return Math.max(0, value - bundle.price);
}

export function getAvailableProducts(): Product[] {
  return products.filter((p) => p.status === "available");
}

export function formatPrice(price: number, currency: string): string {
  if (price === 0) return "TBC";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}
