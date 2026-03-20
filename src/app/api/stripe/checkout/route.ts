import { NextResponse } from "next/server";

import { getViewerState } from "@/lib/profile";
import { createCheckoutSession, getBaseUrl, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const viewer = await getViewerState();

  if (!viewer.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { interval?: "monthly" | "yearly" } | null;
  const interval = body?.interval === "yearly" ? "yearly" : "monthly";
  const baseUrl = getBaseUrl(request.headers.get("origin"));

  try {
    const url = await createCheckoutSession({
      interval,
      successUrl: `${baseUrl}/settings?checkout=success`,
      cancelUrl: `${baseUrl}/settings?checkout=canceled`,
      customerEmail: viewer.user.email,
      customerId: viewer.subscription?.stripe_customer_id ?? null,
      userId: viewer.user.id
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start checkout."
      },
      { status: 500 }
    );
  }
}
