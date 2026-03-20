import type { MetadataRoute } from "next";

import { cities } from "@/lib/cities";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/cities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/radar`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/storms`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/alerts`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/air-quality`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.7
    },
    ...cities.map((city) => ({
      url: `${siteUrl}/${city.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.9
    })),
    ...cities.map((city) => ({
      url: `${siteUrl}/${city.slug}/radar`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7
    }))
  ];
}
