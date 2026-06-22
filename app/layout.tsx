import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { CartDrawer } from "@/components/CartDrawer";
import { C4Credit } from "@/components/C4Credit";
import { CartProvider } from "@/lib/cart";
import { getSiteUrlObject } from "@/lib/site-url";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: "Wooster Core | Performance Big Air Handle",
  description:
    "Precision 3D-printed kitesurfing handle engineered for maximum grip and control during big air sessions. Engineered by Arty Design.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "kitesurfing",
    "kitesurf handle",
    "big air",
    "wooster core",
    "3D printed",
    "performance handle",
    "arty design",
    "woo mount",
  ],
  openGraph: {
    title: "Wooster Core | Performance Big Air Handle",
    description:
      "Precision 3D-printed kitesurfing handle engineered for maximum grip and control during big air sessions.",
    url: "/",
    type: "website",
    images: ["/images/hero-product.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-wooster-black text-wooster-silver antialiased">
        <CartProvider>
          <Navigation />
          <main>{children}</main>
          <C4Credit />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
