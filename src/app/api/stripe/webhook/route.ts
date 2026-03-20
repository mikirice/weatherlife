import { NextResponse } from "next/server";

import {
  findUserIdByStripeCustomerId,
  upsertSubscriptionRecord
} from "@/lib/profile";
import { verifyStripeWebhookSignature } from "@/lib/stripe";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data?: { object?: Record<string, unknown> };
  };
  const object = event.data?.object ?? {};

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(object);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook handling failed."
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(object: Record<string, unknown>) {
  const metadata =
    object.metadata && typeof object.metadata === "object"
      ? (object.metadata as Record<string, unknown>)
      : {};
  const userId = typeof metadata.user_id === "string" ? metadata.user_id : null;

  if (!userId) {
    return;
  }

  await upsertSubscriptionRecord({
    userId,
    stripeCustomerId: typeof object.customer === "string" ? object.customer : null,
    stripeSubscriptionId:
      typeof object.subscription === "string" ? object.subscription : null,
    status: typeof object.status === "string" ? object.status : "active",
    currentPeriodEnd: null
  });
}

async function handleSubscriptionEvent(object: Record<string, unknown>) {
  const metadata =
    object.metadata && typeof object.metadata === "object"
      ? (object.metadata as Record<string, unknown>)
      : {};
  const userIdFromMetadata =
    typeof metadata.user_id === "string" ? metadata.user_id : null;
  const customerId = typeof object.customer === "string" ? object.customer : null;
  const userId = userIdFromMetadata ?? (customerId ? await findUserIdByStripeCustomerId(customerId) : null);

  if (!userId) {
    return;
  }

  const currentPeriodEnd =
    typeof object.current_period_end === "number"
      ? new Date(object.current_period_end * 1000).toISOString()
      : null;

  await upsertSubscriptionRecord({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId:
      typeof object.id === "string" ? object.id : null,
    status: typeof object.status === "string" ? object.status : "inactive",
    currentPeriodEnd
  });
}
