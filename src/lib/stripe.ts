import { createHmac, timingSafeEqual } from "node:crypto";

type BillingInterval = "monthly" | "yearly";

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRICE_MONTHLY_ID &&
      process.env.STRIPE_PRICE_YEARLY_ID
  );
}

export function getStripePriceId(interval: BillingInterval) {
  return interval === "yearly"
    ? process.env.STRIPE_PRICE_YEARLY_ID ?? null
    : process.env.STRIPE_PRICE_MONTHLY_ID ?? null;
}

export async function createCheckoutSession({
  interval,
  successUrl,
  cancelUrl,
  customerEmail,
  customerId,
  userId
}: {
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
  customerId?: string | null;
  userId: string;
}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = getStripePriceId(interval);

  if (!secretKey || !priceId) {
    throw new Error("Stripe is not configured.");
  }

  const body = new URLSearchParams({
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[user_id]": userId,
    "subscription_data[metadata][user_id]": userId,
    allow_promotion_codes: "true"
  });

  if (customerId) {
    body.set("customer", customerId);
  } else if (customerEmail) {
    body.set("customer_email", customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = (await response.json()) as { url?: string; error?: { message?: string } };

  if (!response.ok || !data.url) {
    throw new Error(data.error?.message ?? "Failed to create Stripe checkout session.");
  }

  return data.url;
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !signatureHeader) {
    return false;
  }

  const segments = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );

  const timestamp = segments.t;
  const signature = segments.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const provided = Buffer.from(signature, "hex");
  const computed = Buffer.from(expected, "hex");

  if (provided.length !== computed.length) {
    return false;
  }

  return timingSafeEqual(provided, computed);
}

export function getBaseUrl(originHeader?: string | null) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (originHeader) {
    return originHeader.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
