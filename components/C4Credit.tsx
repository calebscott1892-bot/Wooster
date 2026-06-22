"use client";

import C4FooterCredit from "@/components/c4-footer-credit/C4FooterCredit";

/**
 * Site-wide "Designed by C4 Studios" credit band.
 *
 * Wraps the portable {@link C4FooterCredit} badge (which uses client-only
 * hooks but ships without a `"use client"` directive) so it can be rendered
 * from the server-component root layout. The badge is centred in its own
 * footer band so it appears, front and centre, at the bottom of every page.
 */
export function C4Credit() {
  return (
    <div className="flex justify-center border-t border-white/5 bg-wooster-black px-6 py-8 text-wooster-steel">
      <C4FooterCredit size={40} colorScheme="dark" />
    </div>
  );
}
