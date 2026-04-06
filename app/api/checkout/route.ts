import { NextRequest, NextResponse } from "next/server";

// Stripe integration placeholder
// To enable: set STRIPE_SECRET_KEY in environment variables
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CheckoutItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
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

    // Stripe checkout session creation (placeholder)
    // When ready to go live, uncomment and configure:
    //
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'payment',
    //   payment_method_types: ['card'],
    //   line_items: items.map((item) => ({
    //     price_data: {
    //       currency: 'aud',
    //       product_data: {
    //         name: item.name,
    //       },
    //       unit_amount: Math.round(item.price * 100),
    //     },
    //     quantity: item.quantity,
    //   })),
    //   success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${request.nextUrl.origin}/cart`,
    //   shipping_address_collection: {
    //     allowed_countries: ['AU', 'NZ', 'US', 'GB'],
    //   },
    // });
    //
    // return NextResponse.json({ url: session.url });

    // Placeholder response
    return NextResponse.json({
      url: "/checkout/success",
      message: "Stripe integration pending. Configure STRIPE_SECRET_KEY to enable.",
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
