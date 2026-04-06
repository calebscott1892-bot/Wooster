import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-wooster-black flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-wooster-orange/10 border-2 border-wooster-orange flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl tracking-[0.15em] text-white">
          ORDER CONFIRMED
        </h1>

        <p className="text-wooster-steel mt-6 text-lg">
          Thanks for your order. Your Wooster Core system is being prepared for
          shipping. You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-wooster-orange text-white font-[family-name:var(--font-display)] tracking-[0.15em] rounded hover:bg-wooster-orange-glow transition-colors"
          >
            BACK TO HOME
          </Link>
        </div>

        <p className="text-xs text-wooster-steel/50 mt-12">
          Questions about your order? Contact us at{" "}
          <a
            href="mailto:hello@artydesign.com.au"
            className="text-wooster-orange hover:underline"
          >
            hello@artydesign.com.au
          </a>
        </p>
      </div>
    </div>
  );
}
