import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Header } from "@/components/Header";
import { getViewerState } from "@/lib/profile";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/lib/site";

const verification: Metadata["verification"] = {};
if (process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION) {
  verification.google = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;
}
if (process.env.NEXT_PUBLIC_BING_VERIFICATION) {
  verification.other = {
    "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" }
    ]
  },
  keywords: [
    "weather life index",
    "daily life indices",
    "clothing index",
    "umbrella forecast",
    "laundry drying index",
    "pollen forecast",
    "UV index",
    "exercise weather",
    "comfort index",
    "weather dashboard",
    "what to wear today"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: "/api/og?city=new-york", width: 1200, height: 630, alt: "WeatherLife dashboard preview" }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/api/og?city=new-york"]
  },
  manifest: "/manifest.json",
  ...(Object.keys(verification).length > 0 ? { verification } : {})
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewerState();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              url: getSiteUrl(),
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${getSiteUrl()}/{search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <GoogleAnalytics />
        <AuthProvider initialViewer={viewer}>
          <Header viewer={viewer} />
          {children}
          <footer className="shell pb-8 pt-6">
            <div className="border-t border-gray-200 px-1 pt-5 text-sm text-gray-500">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p>
                  © {new Date().getFullYear()} {siteConfig.name}
                </p>
                <div className="flex items-center gap-4 text-gray-400">
                  <Link href="/about" className="transition-colors hover:text-gray-600">
                    About
                  </Link>
                  <Link href="/cities" className="transition-colors hover:text-gray-600">
                    Cities
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
