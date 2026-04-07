import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";

interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CheckoutItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();

    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Checkout is not configured. Add STRIPE_SECRET_KEY in Vercel before enabling purchases.",
        },
        { status: 503 }
      );
    }

    const lineItems: Array<{
      quantity: number;
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: {
          name: string;
          description: string;
          metadata: {
            productId: string;
            variantId: string;
          };
        };
      };
    }> = [];

    for (const item of items) {
      const product = getProduct(item.productId);

      if (!product || product.status !== "available" || product.price <= 0) {
        return NextResponse.json(
          { error: `Product ${item.productId} is unavailable.` },
          { status: 400 }
        );
      }

      const variant = item.variantId
        ? product.variants?.find((entry) => entry.id === item.variantId)
        : undefined;

      if (item.variantId && !variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} is unavailable.` },
          { status: 400 }
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for ${item.productId}.` },
          { status: 400 }
        );
      }

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: variant ? `${product.name} - ${variant.name}` : product.name,
            description: product.description,
            metadata: {
              productId: product.id,
              variantId: variant?.id || "",
            },
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ["AU", "NZ", "US", "GB"],
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
