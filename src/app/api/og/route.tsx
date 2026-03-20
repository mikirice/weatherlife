import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

import { getCachedDashboardSnapshot } from "@/lib/api/cache";
import { getWeatherDescription } from "@/lib/api/open-meteo";
import { getCityBySlug } from "@/lib/cities";
import { siteConfig } from "@/lib/site";

const imageSize = {
  width: 1200,
  height: 630
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = getCityBySlug(searchParams.get("city") ?? "tokyo");

  if (!city) {
    return NextResponse.json({ error: "City not found." }, { status: 404 });
  }

  try {
    const snapshot = await getCachedDashboardSnapshot({
      lat: city.lat,
      lon: city.lon,
      timezone: city.timezone
    });
    const weatherLabel = getWeatherDescription(snapshot.current.weatherCode);
    const cards = [
      { label: "Clothing", value: snapshot.indices.clothing.score, hint: snapshot.indices.clothing.label },
      { label: "Umbrella", value: snapshot.indices.umbrella.score, hint: snapshot.indices.umbrella.label },
      { label: "Pollen", value: snapshot.indices.pollen.score, hint: snapshot.indices.pollen.label },
      { label: "Laundry", value: snapshot.indices.laundry.score, hint: snapshot.indices.laundry.label }
    ];

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at top left, rgba(102,183,164,0.32), transparent 32%), radial-gradient(circle at bottom right, rgba(220,134,86,0.28), transparent 28%), linear-gradient(135deg, #f5f0e7 0%, #f0f7f4 52%, #fdf7f0 100%)",
            padding: "44px",
            color: "#12212c",
            fontFamily: "Georgia, serif"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              borderRadius: "34px",
              background: "rgba(255,255,255,0.76)",
              border: "1px solid rgba(255,255,255,0.78)",
              boxShadow: "0 24px 60px rgba(20, 39, 48, 0.10)",
              padding: "40px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "680px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    fontSize: "24px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#52616d"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "60px",
                      height: "60px",
                      borderRadius: "18px",
                      background: "linear-gradient(135deg,#1f6a87,#66b7a4)",
                      color: "#ffffff",
                      fontSize: "28px",
                      fontWeight: 700
                    }}
                  >
                    WL
                  </div>
                  <span>{siteConfig.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1 }}>{city.name}</div>
                  <div style={{ fontSize: "28px", color: "#52616d" }}>{city.country}</div>
                </div>
                <div style={{ display: "flex", gap: "18px", alignItems: "baseline" }}>
                  <div style={{ fontSize: "76px", fontWeight: 700 }}>{Math.round(snapshot.current.temperature)}°</div>
                  <div style={{ fontSize: "28px", color: "#52616d" }}>{weatherLabel}</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minWidth: "250px",
                  borderRadius: "28px",
                  background: "linear-gradient(135deg, rgba(27,83,108,0.96), rgba(57,123,121,0.88))",
                  color: "#ffffff",
                  padding: "24px"
                }}
              >
                <div style={{ fontSize: "18px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
                  Today&apos;s lift
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.76)" }}>Comfort</div>
                  <div style={{ fontSize: "54px", fontWeight: 700 }}>{snapshot.indices.comfort.score}/10</div>
                  <div style={{ fontSize: "20px", lineHeight: 1.4 }}>{snapshot.indices.comfort.label}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "18px" }}>
              {cards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flex: 1,
                    minHeight: "166px",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.88)",
                    border: "1px solid rgba(210,221,226,0.9)",
                    padding: "22px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: 700 }}>{card.label}</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "74px",
                        height: "42px",
                        borderRadius: "999px",
                        background: "#e7f4ef",
                        color: "#1a6a59",
                        fontSize: "24px",
                        fontWeight: 700
                      }}
                    >
                      {card.value}/10
                    </div>
                  </div>
                  <div style={{ fontSize: "22px", lineHeight: 1.35, color: "#52616d" }}>{card.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      imageSize
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(31,106,135,1) 0%, rgba(102,183,164,1) 100%)",
            color: "#ffffff",
            fontFamily: "Georgia, serif",
            fontSize: "64px",
            fontWeight: 700
          }}
        >
          {siteConfig.name} · {city.name}
        </div>
      ),
      imageSize
    );
  }
}
