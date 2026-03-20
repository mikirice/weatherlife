import type { City, DashboardSnapshot } from "@/types";

export const siteConfig = {
  name: "WeatherLife",
  tagline: "Daily life indices for 50 cities worldwide",
  description:
    "Free weather dashboard with 16 daily life indices — clothing, umbrella, laundry, pollen, UV, comfort, exercise, and more — for 50 cities worldwide.",
  defaultUrl: "https://weatherlife.org"
} as const;

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!envUrl) {
    return siteConfig.defaultUrl;
  }

  return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function getCityPageTitle(cityName: string) {
  return `${cityName} Weather & Life Indices Today`;
}

export function getCityPageDescription(city: City) {
  return `Today's weather and 16 life indices for ${city.name}, ${city.country} — clothing advice, umbrella forecast, pollen level, UV index, laundry drying, exercise comfort, and more. Free daily dashboard updated hourly.`;
}

export function getCityOgImageUrl(citySlug: string) {
  return absoluteUrl(`/api/og?city=${encodeURIComponent(citySlug)}`);
}

export function buildCityStructuredData({
  city,
  snapshot,
  weatherLabel
}: {
  city: City;
  snapshot: DashboardSnapshot;
  weatherLabel: string;
}) {
  const pageUrl = absoluteUrl(`/${city.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: getCityPageTitle(city.name),
        description: getCityPageDescription(city),
        url: pageUrl,
        isPartOf: {
          "@type": "WebSite",
          name: siteConfig.name,
          url: getSiteUrl()
        },
        about: {
          "@type": "Thing",
          name: `${city.name} daily life indices`
        },
        mainEntity: {
          "@id": `${pageUrl}#forecast`
        },
        primaryImageOfPage: getCityOgImageUrl(city.slug)
      },
      {
        "@type": "WeatherForecast",
        "@id": `${pageUrl}#forecast`,
        name: `Today's weather and life index forecast for ${city.name}`,
        description: `${weatherLabel}. Clothing: ${snapshot.indices.clothing.label}. Umbrella: ${snapshot.indices.umbrella.label}.`,
        url: pageUrl,
        dateIssued: snapshot.fetchedAt,
        dateModified: snapshot.fetchedAt,
        weatherCondition: weatherLabel,
        spatialCoverage: {
          "@type": "Place",
          name: `${city.name}, ${city.country}`,
          geo: {
            "@type": "GeoCoordinates",
            latitude: city.lat,
            longitude: city.lon
          }
        },
        additionalProperty: Object.entries(snapshot.indices).map(
          ([key, idx]) => ({
            "@type": "PropertyValue",
            name: `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")} index`,
            value: (idx as { score: number; label: string }).score,
            unitText: (idx as { score: number; label: string }).label
          })
        )
      }
    ]
  };
}
