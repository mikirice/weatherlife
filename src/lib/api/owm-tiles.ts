export type WeatherLayer = "precipitation_new" | "temp_new" | "wind_new" | "clouds_new" | "pressure_new";

export const WEATHER_LAYERS: { id: WeatherLayer; label: string; icon: string }[] = [
  { id: "precipitation_new", label: "Rain", icon: "🌧️" },
  { id: "temp_new", label: "Temp", icon: "🌡️" },
  { id: "wind_new", label: "Wind", icon: "💨" },
  { id: "clouds_new", label: "Clouds", icon: "☁️" },
  { id: "pressure_new", label: "Pressure", icon: "🔵" },
];

export function getOWMTileUrl(layer: WeatherLayer): string {
  const key = process.env.NEXT_PUBLIC_OWM_API_KEY;
  if (!key) return "";
  return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${key}`;
}
