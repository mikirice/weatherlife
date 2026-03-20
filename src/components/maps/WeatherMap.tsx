"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getRainViewerTileUrl, type RainViewerData } from "@/lib/api/rainviewer";
import { getOWMTileUrl, WEATHER_LAYERS, type WeatherLayer } from "@/lib/api/owm-tiles";

const DARK_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

interface WeatherMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showControls?: boolean;
  mini?: boolean;
  useGeolocation?: boolean;
}

export function WeatherMap({
  center = [35.68, 139.69],
  zoom = 6,
  className = "",
  showControls = true,
  mini = false,
  useGeolocation = false,
}: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const owmLayerRef = useRef<L.TileLayer | null>(null);

  const [rainData, setRainData] = useState<RainViewerData | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"radar" | WeatherLayer>("radar");
  const playRef = useRef(false);

  // Fetch RainViewer data
  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data: RainViewerData) => {
        setRainData(data);
        setFrameIndex(data.radar.past.length - 1);
      })
      .catch(() => {});
  }, []);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: !mini,
      attributionControl: !mini,
      dragging: !mini,
      scrollWheelZoom: !mini,
      doubleClickZoom: !mini,
      touchZoom: !mini,
    });

    L.tileLayer(DARK_TILE, {
      attribution: mini ? "" : DARK_ATTR,
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    // Geolocation: fly to user's position after map init
    if (useGeolocation && !mini && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 8, { duration: 1.5 });
        },
        () => {} // silently fail
      );
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update radar overlay when frame changes
  useEffect(() => {
    if (!mapInstance.current || !rainData) return;

    if (activeLayer === "radar") {
      const frames = rainData.radar.past;
      const frame = frames[frameIndex];
      if (!frame) return;

      if (radarLayerRef.current) {
        mapInstance.current.removeLayer(radarLayerRef.current);
      }

      const tileUrl = getRainViewerTileUrl(frame.path);
      radarLayerRef.current = L.tileLayer(tileUrl, { opacity: 0.7, maxZoom: 18 }).addTo(mapInstance.current);
    }
  }, [rainData, frameIndex, activeLayer]);

  // Update OWM layer
  useEffect(() => {
    if (!mapInstance.current) return;

    if (owmLayerRef.current) {
      mapInstance.current.removeLayer(owmLayerRef.current);
      owmLayerRef.current = null;
    }

    if (activeLayer !== "radar") {
      const url = getOWMTileUrl(activeLayer);
      if (url) {
        owmLayerRef.current = L.tileLayer(url, { opacity: 0.6, maxZoom: 18 }).addTo(mapInstance.current);
      }
    }
  }, [activeLayer]);

  // Hide radar when switching to OWM layer
  useEffect(() => {
    if (!mapInstance.current) return;
    if (activeLayer !== "radar" && radarLayerRef.current) {
      mapInstance.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
  }, [activeLayer]);

  // Animation playback
  useEffect(() => {
    playRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing || !rainData || activeLayer !== "radar") return;

    const frames = rainData.radar.past;
    const interval = setInterval(() => {
      if (!playRef.current) return;
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 600);

    return () => clearInterval(interval);
  }, [playing, rainData, activeLayer]);

  const frames = rainData?.radar.past ?? [];
  const currentTime = frames[frameIndex]?.time;
  const timeLabel = currentTime
    ? new Date(currentTime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`relative overflow-hidden rounded-[20px] ${className}`}>
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: mini ? 200 : 500 }} />

      {showControls && (
        <>
          {/* Layer switcher */}
          <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1">
            <button
              onClick={() => setActiveLayer("radar")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur transition ${
                activeLayer === "radar"
                  ? "bg-teal-600 text-white shadow-lg"
                  : "bg-black/50 text-white/80 hover:bg-black/70"
              }`}
            >
              🌧️ Radar
            </button>
            {WEATHER_LAYERS.filter((l) => l.id !== "precipitation_new").map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur transition ${
                  activeLayer === layer.id
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-black/50 text-white/80 hover:bg-black/70"
                }`}
              >
                {layer.icon} {layer.label}
              </button>
            ))}
          </div>

          {/* Timeline slider (radar only) */}
          {activeLayer === "radar" && frames.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-center gap-3 rounded-2xl bg-black/60 px-4 py-2.5 backdrop-blur">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white text-sm"
              >
                {playing ? "⏸" : "▶"}
              </button>
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                value={frameIndex}
                onChange={(e) => {
                  setPlaying(false);
                  setFrameIndex(Number(e.target.value));
                }}
                className="flex-1 accent-teal-400"
              />
              <span className="min-w-[4.5rem] text-right text-xs font-medium text-white/90">
                {timeLabel}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
