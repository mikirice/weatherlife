import type {
  CurrentConditions,
  DailyWeatherSummary,
  HourlyForecastItem,
  PollenSummary
} from "@/types/weather";

export type LifeIndexKey =
  | "clothing"
  | "umbrella"
  | "laundry"
  | "pollen"
  | "uv"
  | "coldRisk"
  | "exercise"
  | "comfort"
  | "stargazing"
  | "carWash"
  | "skinDryness"
  | "pipeFreezing"
  | "heatingCooling"
  | "nabe"
  | "beer"
  | "iceCream";

export interface LifeIndexResult {
  score: number;
  label: string;
  seasonal?: boolean;
  inSeason?: boolean;
}

export type IndexDirection = "higher" | "lower" | "neutral";
export type IndexTier = "free" | "pro";

export interface LifeIndexMeta {
  key: LifeIndexKey;
  title: string;
  icon: string;
  direction: IndexDirection;
  tier: IndexTier;
}

export type LifeIndices = Record<LifeIndexKey, LifeIndexResult>;

export interface LifeIndexInput {
  date: string;
  current: CurrentConditions;
  night: Pick<CurrentConditions, "cloudCover" | "visibility" | "weatherCode" | "isDay">;
  summary: DailyWeatherSummary;
  pollen: PollenSummary;
  next48HourRainProbability: number;
}

export interface City {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  countryCode: string;
  timezone: string;
  population?: number;
}

export interface DashboardSnapshot {
  current: CurrentConditions;
  summary: DailyWeatherSummary;
  hourly: HourlyForecastItem[];
  pollen: PollenSummary;
  indices: LifeIndices;
  forecast: Array<{
    date: string;
    label: string;
    indices: LifeIndices;
    summary: DailyWeatherSummary;
  }>;
  hourlyInsights: Array<{
    key: LifeIndexKey;
    title: string;
    icon: string;
    summary: string;
  }>;
  fetchedAt: string;
  rounded: {
    lat: number;
    lon: number;
  };
  source: "live" | "memory-cache" | "supabase-cache";
}

export interface SavedLocation {
  slug: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface UserPreferences {
  pollen_alert: boolean;
  runner: boolean;
  cyclist: boolean;
  units: "metric" | "imperial";
}

export interface UserProfile {
  id: string;
  saved_locations: SavedLocation[];
  preferences: UserPreferences;
  plan: "free" | "pro";
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

export interface ViewerState {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  profile: UserProfile | null;
  subscription: SubscriptionRecord | null;
  isPro: boolean;
}

export type {
  CurrentConditions,
  DailyWeatherSummary,
  HourlyForecastItem,
  PollenSummary
} from "@/types/weather";
