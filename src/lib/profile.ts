import type { User } from "@supabase/supabase-js";

import type {
  SavedLocation,
  SubscriptionRecord,
  UserPreferences,
  UserProfile,
  ViewerState
} from "@/types";
import { getSessionFromCookies } from "@/lib/supabase-server";
import {
  getSupabaseAdminClient,
  serializeViewerUser
} from "@/lib/supabase";

export const defaultUserPreferences: UserPreferences = {
  pollen_alert: false,
  runner: false,
  cyclist: false,
  units: "metric"
};

export async function getViewerState(): Promise<ViewerState> {
  const session = await getSessionFromCookies();
  const user = session?.user ?? null;

  if (!user) {
    return {
      user: null,
      profile: null,
      subscription: null,
      isPro: false
    };
  }

  const profile = await ensureProfile(user);
  const subscription = await getLatestSubscription(user.id);
  const isPro = profile?.plan === "pro" || subscription?.status === "active";

  return {
    user: serializeViewerUser(user),
    profile,
    subscription,
    isPro
  };
}

export async function ensureProfile(user: User | { id: string }) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const existing = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.data) {
    return normalizeProfile(existing.data);
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      saved_locations: [],
      preferences: defaultUserPreferences,
      plan: "free"
    })
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return normalizeProfile(data);
}

export async function getLatestSubscription(userId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeSubscription(data);
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const profile = await ensureProfile({ id: userId });
  if (!profile) {
    return null;
  }

  const nextPreferences: UserPreferences = {
    ...defaultUserPreferences,
    ...profile.preferences,
    ...preferences
  };

  const { data, error } = await supabase
    .from("profiles")
    .update({ preferences: nextPreferences })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return normalizeProfile(data);
}

export async function addSavedLocation(userId: string, location: SavedLocation, limit = 5) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const profile = await ensureProfile({ id: userId });
  if (!profile) {
    return null;
  }

  const deduped = profile.saved_locations.filter((item) => item.slug !== location.slug);
  const nextSavedLocations = [location, ...deduped].slice(0, limit);

  const { data, error } = await supabase
    .from("profiles")
    .update({ saved_locations: nextSavedLocations })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return normalizeProfile(data);
}

export async function removeSavedLocation(userId: string, slug: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const profile = await ensureProfile({ id: userId });
  if (!profile) {
    return null;
  }

  const nextSavedLocations = profile.saved_locations.filter((item) => item.slug !== slug);

  const { data, error } = await supabase
    .from("profiles")
    .update({ saved_locations: nextSavedLocations })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return null;
  }

  return normalizeProfile(data);
}

export async function upsertSubscriptionRecord({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  currentPeriodEnd
}: {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  await ensureProfile({ id: userId });

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status,
        current_period_end: currentPeriodEnd
      },
      {
        onConflict: "stripe_subscription_id"
      }
    )
    .select("*")
    .single();

  await supabase
    .from("profiles")
    .update({
      plan: status === "active" || status === "trialing" ? "pro" : "free"
    })
    .eq("id", userId);

  if (error || !data) {
    return null;
  }

  return normalizeSubscription(data);
}

export async function findUserIdByStripeCustomerId(stripeCustomerId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return typeof data.user_id === "string" ? data.user_id : null;
}

function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const rawPreferences =
    raw.preferences && typeof raw.preferences === "object"
      ? (raw.preferences as Partial<UserPreferences>)
      : {};
  const rawSavedLocations = Array.isArray(raw.saved_locations)
    ? raw.saved_locations
    : [];

  return {
    id: String(raw.id),
    saved_locations: rawSavedLocations
      .filter((item): item is SavedLocation => Boolean(item && typeof item === "object"))
      .map((item) => ({
        slug: String(item.slug),
        name: String(item.name),
        country: String(item.country),
        lat: Number(item.lat),
        lon: Number(item.lon),
        timezone: String(item.timezone)
      })),
    preferences: {
      ...defaultUserPreferences,
      pollen_alert: Boolean(rawPreferences.pollen_alert),
      runner: Boolean(rawPreferences.runner),
      cyclist: Boolean(rawPreferences.cyclist),
      units: rawPreferences.units === "imperial" ? "imperial" : "metric"
    },
    plan: raw.plan === "pro" ? "pro" : "free",
    created_at: typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString()
  };
}

function normalizeSubscription(raw: Record<string, unknown>): SubscriptionRecord {
  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    stripe_customer_id:
      typeof raw.stripe_customer_id === "string" ? raw.stripe_customer_id : null,
    stripe_subscription_id:
      typeof raw.stripe_subscription_id === "string" ? raw.stripe_subscription_id : null,
    status: typeof raw.status === "string" ? raw.status : "inactive",
    current_period_end:
      typeof raw.current_period_end === "string" ? raw.current_period_end : null,
    created_at: typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString()
  };
}
