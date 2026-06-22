import Link from "next/link";

const steps = [
  {
    code: "01",
    title: "CONFIRMATION",
    desc: "Order receipt is on its way to your inbox",
  },
  {
    code: "02",
    title: "PRINT QUEUE",
    desc: "Your components enter the production queue",
  },
  {
    code: "03",
    title: "DISPATCH",
    desc: "Quality-checked, packed and shipped to you",
  },
];

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-wooster-black flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        {/* Success icon — check draws itself in */}
        <div className="ring-pulse w-20 h-20 mx-auto mb-8 rounded-full bg-wooster-orange/10 border-2 border-wooster-orange flex items-center justify-center">
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
            <polyline className="check-draw" points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="font-[family-name:var(--font-mono)] text-wooster-orange text-xs tracking-[0.4em] uppercase mb-4">
          Print Job Accepted
        </p>

        <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl tracking-[0.15em] text-white">
          ORDER CONFIRMED
        </h1>

        <p className="text-wooster-steel mt-6 text-lg">
          Thanks for your order. Your Wooster Core system is being prepared for
          shipping. You&apos;ll receive a confirmation email shortly.
        </p>

        {/* What happens next */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {steps.map((step) => (
            <div
              key={step.code}
              className="p-4 bg-wooster-charcoal/30 border border-white/5 rounded-lg"
            >
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] text-wooster-orange/60">
                {step.code}
              </p>
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.15em] text-white mt-1">
                {step.title}
              </p>
              <p className="text-xs text-wooster-steel mt-1.5 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

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
