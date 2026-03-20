# Weather API Research for DailyPulse
## Updated: 2026-03-19

---

## 1. Weather Radar (Rain/Precipitation Map)

### RainViewer API (RECOMMENDED)
- URL: https://www.rainviewer.com/api/weather-maps-api.html
- Auth: No API key required (free tier)
- Rate limits: 1,000 requests/day (free), rate limit resets every 1 minute for tiles
- Data available:
  - Past radar data (precipitation movement animation)
  - Tile-based overlay (256px tiles, max zoom level 7 on free)
  - Universal Blue color scheme only (free tier)
  - PNG format only
- Global coverage: Yes (worldwide radar coverage)
- Integration method: Tile overlay on Leaflet/Mapbox
- Leaflet integration: Official example at https://github.com/rainviewer/rainviewer-api-example
- Notes:
  - FREE tier: past radar only, no forecast/nowcast, no satellite
  - Paid plans start at $40/month for nowcast + satellite
  - Sufficient for showing animated past-hour precipitation movement
  - Non-commercial use only on free tier

### OpenWeatherMap Precipitation Tiles (ALTERNATIVE)
- URL: https://openweathermap.org/api/weathermaps
- Auth: Free API key required
- Rate limits: 1,000 calls/day (free tier)
- Data available: `precipitation_new` layer tiles
- Integration: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={key}`
- Notes: Part of Weather Maps 1.0 (free), updated every 3 hours

---

## 2. Hurricane/Typhoon Tracker

### NOAA NHC (National Hurricane Center) - Atlantic + East Pacific (RECOMMENDED)
- URL: https://www.nhc.noaa.gov/gis/
- Auth: No API key required, completely free
- Rate limits: No formal rate limit (public government data)
- Data available:
  - `CurrentStorms.json` - live active storms: https://www.nhc.noaa.gov/CurrentStorms.json
  - Forecast track (points + line out to 120 hours)
  - Forecast cone of uncertainty
  - Wind speed probabilities
  - Storm surge watches/warnings
- Global coverage: Atlantic + Eastern Pacific basins only
- Integration method: JSON + Shapefiles + KML/KMZ
- GeoJSON conversion: https://github.com/WSJ/hurricane-helper
- Notes:
  - Updates every 6 hours (every 3 hours near landfall)
  - ArcGIS MapServer available: https://mapservices.weather.noaa.gov/tropical/rest/services/tropical/NHC_tropical_weather/MapServer
  - Supports JSON/GeoJSON query output

### JTWC (Joint Typhoon Warning Center) - Western Pacific + Indian Ocean
- URL: https://www.metoc.navy.mil/jtwc/jtwc.html
- Auth: No key required (public military data)
- Data available: Active typhoon warnings, track data, wind analysis
- Global coverage: Western Pacific, Indian Ocean, Southern Hemisphere
- Integration: RSS feeds + text bulletins (no direct JSON API)
- Notes: More difficult to parse programmatically; consider scraping or using IBTrACS

### IBTrACS (Historical + Near-Real-Time Global Data)
- URL: https://www.ncei.noaa.gov/products/international-best-track-archive
- Auth: No key required
- Data available: Global tropical cyclone tracks from 1842 to present, position, intensity, wind radii
- Global coverage: Yes (all basins worldwide)
- Integration: CSV/NetCDF download, no real-time JSON API
- Notes:
  - Best for historical analysis + supplemental data
  - Python library `tropycal` provides programmatic access
  - Not suitable for real-time tracking alone

### Recommended Strategy for Hurricane/Typhoon:
1. NHC CurrentStorms.json for Atlantic/East Pacific (real-time, easy JSON)
2. JTWC RSS/bulletins for Western Pacific (parse or use proxy)
3. IBTrACS for historical context and global coverage

---

## 3. Severe Weather Alerts

### NWS API (US Only) (RECOMMENDED for US)
- URL: https://api.weather.gov/alerts
- Auth: No API key required (User-Agent header only)
- Rate limits: Generous, request no more than every 30 seconds
- Data available:
  - All active US weather alerts (watches, warnings, advisories)
  - By location (point, zone, area)
  - CAP-compliant XML + GeoJSON output
- Global coverage: US only
- Integration method: REST API (JSON/GeoJSON)
- Notes: Completely free US government service, no account needed

### MeteoAlarm (Europe)
- URL: https://api.meteoalarm.org/
- Auth: Registration required
- Data available: Severe weather warnings across European countries
- Global coverage: Europe (EUMETNET members)
- Integration: REST API with CAP format
- Notes: Official European warning aggregator

### GDACS (Global Disasters)
- URL: https://www.gdacs.org/Alerts/
- Auth: No key required
- Data available: Earthquakes, floods, tropical cyclones, droughts globally
- Global coverage: Yes
- Integration: RSS/XML feeds, can use Apify wrapper for JSON
- Notes: More for major disaster events than daily weather alerts

### OpenWeatherMap Alerts (Global, but requires paid)
- URL: https://openweathermap.org/api/push-weather-alerts
- Auth: API key required
- Notes: Push weather alerts from national warning systems worldwide. However, this appears to be a paid feature, not in the free tier.

### Recommended Strategy for Alerts:
1. NWS API for US coverage (free, excellent)
2. MeteoAlarm for European coverage
3. GDACS RSS for global major events
4. Note: Open-Meteo does NOT have weather alerts (feature requested: https://github.com/open-meteo/open-meteo/issues/351)

---

## 4. Weather Maps (Temperature, Wind, Clouds, Pressure)

### OpenWeatherMap Weather Maps 1.0 (RECOMMENDED)
- URL: https://openweathermap.org/api/weathermaps
- Auth: Free API key required
- Rate limits: 1,000 API calls/day (but tile loads may have separate limits)
- Data available (tile layers):
  - `temp_new` - Temperature
  - `wind_new` - Wind speed
  - `pressure_new` - Sea-level pressure
  - `clouds_new` - Cloud cover
  - `precipitation_new` - Precipitation
- Global coverage: Yes
- Integration method: Tile URL pattern: `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={key}`
- Leaflet plugin: https://github.com/buche/leaflet-openweathermap
- Notes:
  - Free tier: current data only, updates every 3 hours
  - Maps 2.0 (forecast/historical) requires paid plan
  - Direct Leaflet/OpenLayers integration supported

### Open-Meteo (Data Only, No Tiles)
- URL: https://open-meteo.com/en/docs
- Auth: No API key required
- Data available: Temperature, wind, humidity, pressure as JSON data points
- Notes: No tile/map overlay support - data only. Could be used to generate custom overlays but requires significant frontend work.

---

## 5. Air Quality

### Open-Meteo Air Quality API (CONFIRMED SUFFICIENT)
- URL: https://open-meteo.com/en/docs/air-quality-api
- Auth: No API key required
- Rate limits: 10,000 calls/day (non-commercial), currently no enforcement
- Data available:
  - PM10, PM2.5
  - CO, NO2, SO2, O3
  - Aerosol Optical Depth
  - Dust concentration
  - UV Index, UV Index Clear Sky
  - European AQI, US AQI
- Global coverage: Yes (CAMS European 11km + CAMS Global 40km)
- Integration method: REST API (JSON)
- Forecast: 5-day hourly forecast
- Notes: Already integrated in the project. Fully sufficient for air quality needs.

---

## Map Library Recommendation

### Leaflet + OpenStreetMap (RECOMMENDED)
- **Cost**: Completely free (BSD-2-Clause license)
- **Why**:
  - No usage limits or billing
  - Largest plugin ecosystem (weather overlays, tile layers, markers)
  - RainViewer has official Leaflet example
  - OpenWeatherMap has Leaflet plugin
  - Lightweight (~42KB gzipped)
  - 1.4M+ downloads/month, massive community
  - Works with any tile provider

### Mapbox GL JS (ALTERNATIVE)
- **Cost**: 50,000 free map loads/month, then $5/1,000 loads
- **Why consider**: WebGL-based, smoother animations, better for 3D
- **Why avoid**: Proprietary license since v2, costs can escalate
- **Note**: MapLibre GL JS is the open-source fork (free alternative to Mapbox GL)

### Google Maps (NOT RECOMMENDED)
- $200/month free credit but costs add up fast
- Less flexible for weather tile overlays
- Proprietary

### Verdict: Use **Leaflet** with **OpenStreetMap** tiles
- Zero cost, maximum flexibility
- Best ecosystem for weather overlays
- RainViewer + OWM both have Leaflet examples/plugins

---

## How Major Sites Display Radar

- **weather.com**: Custom proprietary radar using their own The Weather Company data pipeline
- **AccuWeather**: Custom proprietary radar, embedded via their platform
- **Windy.com**: Custom WebGL-based renderer, offers embeddable iframe widget (free for personal use)
- **RainViewer**: Provides embeddable map + API tiles (what we should use)

### Windy Embed Option
- URL: https://embed.windy.com/
- Free embeddable weather map with multiple layers
- Can be embedded via iframe (limited customization)
- Alternative to building custom map if rapid MVP needed

---

## Summary: Recommended API Stack

| Feature | API | Cost | Key Needed |
|---------|-----|------|------------|
| Weather Radar | RainViewer | Free | No |
| Weather Map Tiles | OpenWeatherMap 1.0 | Free | Yes (free key) |
| Hurricane (Atlantic) | NOAA NHC JSON | Free | No |
| Hurricane (Pacific) | JTWC + IBTrACS | Free | No |
| Alerts (US) | NWS api.weather.gov | Free | No |
| Alerts (Europe) | MeteoAlarm | Free | Registration |
| Alerts (Global) | GDACS RSS | Free | No |
| Air Quality | Open-Meteo AQ | Free | No |
| Base Map | Leaflet + OSM | Free | No |

### API Keys Needed:
1. OpenWeatherMap - free registration at https://openweathermap.org/api
2. MeteoAlarm - registration at https://api.meteoalarm.org/ (for European alerts)

### No Key Needed:
- RainViewer, NWS, NOAA NHC, GDACS, Open-Meteo, IBTrACS
