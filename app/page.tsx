import { Hero } from "@/components/Hero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ExplodedView } from "@/components/ExplodedView";
import { SpecsSection } from "@/components/SpecsSection";
import { ActionCTA } from "@/components/ActionCTA";
import { SocialProof } from "@/components/SocialProof";
import { Footer } from "@/components/Footer";
import { products } from "@/lib/products";

// Schema.org structured data for products
function ProductStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products
      .filter((p) => p.status === "available")
      .map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: {
            "@type": "Brand",
            name: "Wooster Core",
          },
          manufacturer: {
            "@type": "Organization",
            name: "Arty Design",
          },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency,
            availability: "https://schema.org/InStock",
          },
        },
      })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <ProductStructuredData />
      <Hero />
      <ProductCarousel />
      <ExplodedView />
      <SpecsSection />
      <ActionCTA />
      <SocialProof />
      <Footer />
    </>
  );
}
