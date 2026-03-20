import type {
  CurrentConditions,
  DailyWeatherSummary,
  DayWeatherSnapshot,
  HourlyForecastItem,
  HourlyWeatherPoint,
  OpenMeteoForecastResponse,
  WeatherSnapshot
} from "@/types/weather";

const FORECAST_DAYS = 10;

/**
 * Simple request queue to avoid hitting Open-Meteo rate limits (429)
 * during static page generation when many cities are built concurrently.
 */
const REQUEST_DELAY_MS = 200;
let lastRequestTime = 0;
const requestQueue = Promise.resolve();
let queueChain = requestQueue;

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  const task = queueChain.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < REQUEST_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS - elapsed));
    }
    lastRequestTime = Date.now();
    return fn();
  });
  queueChain = task.then(() => undefined, () => undefined);
  return task;
}

const HOURLY_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "wind_speed_10m",
  "precipitation_probability",
  "weather_code",
  "cloud_cover",
  "visibility",
  "uv_index",
  "shortwave_radiation",
  "sunshine_duration"
];

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "wind_speed_10m",
  "precipitation_probability",
  "weather_code",
  "cloud_cover",
  "uv_index",
  "is_day"
];

const DAILY_FIELDS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "uv_index_max",
  "sunshine_duration"
];

export async function fetchOpenMeteoForecast({
  lat,
  lon,
  timezone
}: {
  lat: number;
  lon: number;
  timezone?: string;
}) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: timezone ?? "auto",
    forecast_days: String(FORECAST_DAYS),
    temperature_unit: "celsius",
    wind_speed_unit: "ms",
    precipitation_unit: "mm",
    current: CURRENT_FIELDS.join(","),
    hourly: HOURLY_FIELDS.join(","),
    daily: DAILY_FIELDS.join(",")
  });

  try {
    const data = await enqueueRequest(async () => {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
        next: {
          revalidate: 60 * 60
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo request failed with ${response.status}`);
      }

      return (await response.json()) as OpenMeteoForecastResponse;
    });

    return data;
  } catch (error) {
    console.warn("Open-Meteo fetch failed, using fallback mock data:", (error as Error).message);
    return buildMockForecast(lat, lon, timezone ?? "auto");
  }
}

export function buildWeatherSnapshot(raw: OpenMeteoForecastResponse): WeatherSnapshot {
  const hourlyPoints = buildHourlyPoints(raw);
  const currentIndex = raw.hourly.time.indexOf(raw.current.time);
  const current = buildCurrentConditions(raw, Math.max(currentIndex, 0));
  const daily = raw.daily.time.map((date, dayIndex) => buildDayWeatherSnapshot(raw, hourlyPoints, date, dayIndex, current));
  const summary = daily[0]?.summary ?? buildDailySummary(raw.daily.time[0] ?? current.time.slice(0, 10), hourlyPoints, raw, 0, current.weatherCode);
  const hourly = buildHourlyForecast(hourlyPoints, daily[0]?.date ?? current.time.slice(0, 10));

  return {
    current,
    summary,
    hourly,
    hourlyPoints,
    daily,
    raw
  };
}

export function getWeatherDescription(weatherCode: number) {
  if (weatherCode === 0) {
    return "Clear";
  }
  if ([1, 2].includes(weatherCode)) {
    return "Partly cloudy";
  }
  if (weatherCode === 3) {
    return "Overcast";
  }
  if ([45, 48].includes(weatherCode)) {
    return "Foggy";
  }
  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "Drizzle";
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return "Rain";
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "Snow";
  }
  if ([95, 96, 99].includes(weatherCode)) {
    return "Thunderstorm";
  }
  return "Mixed conditions";
}

export function getWeatherEmoji(weatherCode: number, isDay = true) {
  if (weatherCode === 0) {
    return isDay ? "☀️" : "🌙";
  }
  if ([1, 2].includes(weatherCode)) {
    return isDay ? "⛅" : "🌤️";
  }
  if (weatherCode === 3) {
    return "☁️";
  }
  if ([45, 48].includes(weatherCode)) {
    return "🌫️";
  }
  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "🌦️";
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return "🌧️";
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "❄️";
  }
  if ([95, 96, 99].includes(weatherCode)) {
    return "⛈️";
  }
  return "🌤️";
}

export function isRainCode(weatherCode: number) {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);
}

function buildHourlyPoints(raw: OpenMeteoForecastResponse): HourlyWeatherPoint[] {
  return raw.hourly.time.map((time, index) => {
    const hourNumber = Number.parseInt(time.slice(11, 13), 10);

    return {
      time,
      temperature: raw.hourly.temperature_2m[index] ?? 0,
      apparentTemperature: raw.hourly.apparent_temperature[index] ?? raw.hourly.temperature_2m[index] ?? 0,
      humidity: raw.hourly.relative_humidity_2m[index] ?? 0,
      windSpeed: raw.hourly.wind_speed_10m[index] ?? 0,
      precipitationProbability: raw.hourly.precipitation_probability[index] ?? 0,
      weatherCode: raw.hourly.weather_code[index] ?? raw.current.weather_code,
      cloudCover: raw.hourly.cloud_cover[index] ?? 0,
      visibility: raw.hourly.visibility[index] ?? raw.current.visibility ?? 0,
      uvIndex: raw.hourly.uv_index[index] ?? 0,
      sunshineDuration: raw.hourly.sunshine_duration[index] ?? 0,
      isDay: hourNumber >= 6 && hourNumber < 18
    };
  });
}

function buildCurrentConditions(raw: OpenMeteoForecastResponse, hourlyIndex: number): CurrentConditions {
  return {
    time: raw.current.time,
    temperature: raw.current.temperature_2m,
    apparentTemperature: raw.current.apparent_temperature,
    humidity: raw.current.relative_humidity_2m,
    windSpeed: raw.current.wind_speed_10m,
    precipitationProbability: raw.current.precipitation_probability,
    weatherCode: raw.current.weather_code,
    cloudCover: raw.current.cloud_cover,
    uvIndex: raw.current.uv_index,
    visibility: raw.current.visibility ?? raw.hourly.visibility[hourlyIndex] ?? 0,
    isDay: raw.current.is_day === 1
  };
}

function buildDayWeatherSnapshot(
  raw: OpenMeteoForecastResponse,
  hourlyPoints: HourlyWeatherPoint[],
  date: string,
  dayIndex: number,
  current: CurrentConditions
): DayWeatherSnapshot {
  const dayPoints = hourlyPoints.filter((point) => point.time.startsWith(date));
  const middayPoint = pickClosestPoint(dayPoints, 14);
  const nightPoint = pickClosestPoint(dayPoints, 21) ?? middayPoint;
  const summary = buildDailySummary(date, dayPoints, raw, dayIndex, middayPoint?.weatherCode ?? current.weatherCode);

  return {
    date,
    current:
      dayIndex === 0
        ? current
        : toCurrentConditions(date, middayPoint, {
            temperature: summary.averageTemperature,
            apparentTemperature: summary.averageTemperature,
            humidity: summary.averageHumidity,
            windSpeed: summary.averageWindSpeed,
            precipitationProbability: summary.maxPrecipitationProbability,
            weatherCode: summary.representativeWeatherCode,
            cloudCover: 50,
            uvIndex: summary.maxUvIndex,
            visibility: 20000,
            isDay: true
          }),
    night: {
      cloudCover: nightPoint?.cloudCover ?? 50,
      visibility: nightPoint?.visibility ?? 20000,
      weatherCode: nightPoint?.weatherCode ?? summary.representativeWeatherCode,
      isDay: false
    },
    summary
  };
}

function buildDailySummary(
  date: string,
  points: HourlyWeatherPoint[],
  raw: OpenMeteoForecastResponse,
  dayIndex: number,
  fallbackWeatherCode: number
): DailyWeatherSummary {
  const temperatureValues = points.map((point) => point.temperature);
  const humidityValues = points.map((point) => point.humidity);
  const windValues = points.map((point) => point.windSpeed);
  const precipitationValues = points.map((point) => point.precipitationProbability);
  const uvValues = points.map((point) => point.uvIndex);
  const weatherValues = points.map((point) => point.weatherCode);
  const sunshineValues = points.map((point) => point.sunshineDuration);
  const minTemperature = raw.daily.temperature_2m_min[dayIndex] ?? min(temperatureValues);
  const maxTemperature = raw.daily.temperature_2m_max[dayIndex] ?? max(temperatureValues);

  return {
    date,
    minTemperature: roundToOne(minTemperature),
    maxTemperature: roundToOne(maxTemperature),
    averageTemperature: roundToOne(average(temperatureValues)),
    averageHumidity: Math.round(average(humidityValues)),
    averageWindSpeed: roundToOne(average(windValues)),
    maxPrecipitationProbability: Math.round(raw.daily.precipitation_probability_max[dayIndex] ?? max(precipitationValues)),
    maxUvIndex: roundToOne(raw.daily.uv_index_max[dayIndex] ?? max(uvValues)),
    sunshineHours: roundToOne((raw.daily.sunshine_duration[dayIndex] ?? sum(sunshineValues)) / 3600),
    temperatureRange: roundToOne(maxTemperature - minTemperature),
    representativeWeatherCode: getRepresentativeWeatherCode(weatherValues, precipitationValues, fallbackWeatherCode)
  };
}

function buildHourlyForecast(points: HourlyWeatherPoint[], date: string): HourlyForecastItem[] {
  const desiredHours = [6, 9, 12, 15, 18, 21];
  const dayPoints = points.filter((point) => point.time.startsWith(date));

  return desiredHours
    .map((hour) => pickClosestPoint(dayPoints, hour))
    .filter((point): point is HourlyWeatherPoint => Boolean(point))
    .map((point) => {
      const hourNumber = Number.parseInt(point.time.slice(11, 13), 10);

      return {
        time: point.time,
        displayTime: formatHour(hourNumber),
        temperature: Math.round(point.temperature),
        precipitationProbability: Math.round(point.precipitationProbability),
        weatherCode: point.weatherCode,
        uvIndex: roundToOne(point.uvIndex),
        isDay: point.isDay
      };
    });
}

function pickClosestPoint(points: HourlyWeatherPoint[], targetHour: number) {
  let bestPoint: HourlyWeatherPoint | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const point of points) {
    const hour = Number.parseInt(point.time.slice(11, 13), 10);
    const distance = Math.abs(hour - targetHour);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestPoint = point;
    }
  }

  return bestPoint;
}

function toCurrentConditions(
  date: string,
  point: HourlyWeatherPoint | null,
  fallback: Omit<CurrentConditions, "time">
): CurrentConditions {
  if (!point) {
    return {
      time: `${date}T14:00`,
      ...fallback
    };
  }

  return {
    time: point.time,
    temperature: point.temperature,
    apparentTemperature: point.apparentTemperature,
    humidity: point.humidity,
    windSpeed: point.windSpeed,
    precipitationProbability: point.precipitationProbability,
    weatherCode: point.weatherCode,
    cloudCover: point.cloudCover,
    uvIndex: point.uvIndex,
    visibility: point.visibility,
    isDay: point.isDay
  };
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}${suffix}`;
}

function getRepresentativeWeatherCode(codes: number[], precipitationValues: number[], fallback: number) {
  const rainyIndex = codes.findIndex((code, index) => isRainCode(code) || (precipitationValues[index] ?? 0) >= 45);
  if (rainyIndex >= 0) {
    return codes[rainyIndex] ?? fallback;
  }

  return codes[Math.floor(codes.length / 2)] ?? fallback;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return sum(values) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function max(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((highest, value) => Math.max(highest, value), Number.NEGATIVE_INFINITY);
}

function min(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((lowest, value) => Math.min(lowest, value), Number.POSITIVE_INFINITY);
}

function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}

function buildMockForecast(lat: number, lon: number, timezone: string): OpenMeteoForecastResponse {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const hours = Array.from({ length: FORECAST_DAYS * 24 }, (_, index) => {
    const date = new Date(start.getTime() + index * 60 * 60 * 1000);
    return `${date.toISOString().slice(0, 13)}:00`;
  });
  const currentHour = now.getUTCHours();
  const baseTemp = 15 + (30 - Math.abs(lat)) / 3;

  const hourlyTemp = hours.map((_, index) => {
    const hourOfDay = index % 24;
    const dayOffset = Math.floor(index / 24);
    return roundToOne(baseTemp + Math.sin((hourOfDay - 6) * Math.PI / 12) * 5 + dayOffset * 0.35);
  });
  const hourlyApparent = hourlyTemp.map((temperature, index) => roundToOne(temperature - (index % 24 < 6 ? 2 : 1)));
  const hourlyHumidity = hours.map((_, index) => Math.round(58 + Math.cos(((index % 24) - 14) * Math.PI / 12) * 18));
  const hourlyWind = hours.map((_, index) => roundToOne(2 + ((index * 7) % 13) / 5));
  const hourlyPrecipProb = hours.map((_, index) => {
    const wave = Math.sin((index % 48) * Math.PI / 12);
    return Math.round(Math.max(0, wave > 0 ? wave * 45 : 6));
  });
  const hourlyWeatherCode = hours.map((_, index) => {
    const precip = hourlyPrecipProb[index] ?? 0;
    if (precip >= 60) {
      return 63;
    }
    if (precip >= 35) {
      return 61;
    }
    return index % 24 >= 6 && index % 24 <= 17 ? 2 : 0;
  });
  const hourlyCloud = hours.map((_, index) => Math.round(25 + ((index * 11) % 55)));
  const hourlyVisibility = hours.map((_, index) => 18000 + ((index * 37) % 7000));
  const hourlyUv = hours.map((_, index) => {
    const hourOfDay = index % 24;
    return roundToOne(hourOfDay >= 6 && hourOfDay <= 17 ? Math.max(0, 5 * Math.sin((hourOfDay - 6) * Math.PI / 12)) : 0);
  });
  const hourlyRadiation = hours.map((_, index) => {
    const hourOfDay = index % 24;
    return Math.round(hourOfDay >= 6 && hourOfDay <= 17 ? 420 * Math.sin((hourOfDay - 6) * Math.PI / 12) : 0);
  });
  const hourlySunshine = hours.map((_, index) => {
    const hourOfDay = index % 24;
    return hourOfDay >= 6 && hourOfDay <= 17 ? 2200 : 0;
  });

  const dailyTime = Array.from({ length: FORECAST_DAYS }, (_, dayIndex) => {
    const date = new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });

  return {
    latitude: lat,
    longitude: lon,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    timezone,
    timezone_abbreviation: "UTC",
    elevation: 0,
    current_units: {},
    current: {
      time: hours[Math.min(currentHour, hours.length - 1)],
      interval: 900,
      temperature_2m: hourlyTemp[currentHour] ?? baseTemp,
      apparent_temperature: hourlyApparent[currentHour] ?? baseTemp - 1,
      relative_humidity_2m: hourlyHumidity[currentHour] ?? 60,
      wind_speed_10m: hourlyWind[currentHour] ?? 3,
      precipitation_probability: hourlyPrecipProb[currentHour] ?? 10,
      weather_code: hourlyWeatherCode[currentHour] ?? 2,
      cloud_cover: hourlyCloud[currentHour] ?? 40,
      uv_index: hourlyUv[currentHour] ?? 0,
      visibility: hourlyVisibility[currentHour] ?? 22000,
      is_day: currentHour >= 6 && currentHour < 18 ? 1 : 0
    },
    hourly_units: {},
    hourly: {
      time: hours,
      temperature_2m: hourlyTemp,
      apparent_temperature: hourlyApparent,
      relative_humidity_2m: hourlyHumidity,
      wind_speed_10m: hourlyWind,
      precipitation_probability: hourlyPrecipProb,
      weather_code: hourlyWeatherCode,
      cloud_cover: hourlyCloud,
      visibility: hourlyVisibility,
      uv_index: hourlyUv,
      shortwave_radiation: hourlyRadiation,
      sunshine_duration: hourlySunshine
    },
    daily_units: {},
    daily: {
      time: dailyTime,
      temperature_2m_max: dailyTime.map((_, dayIndex) => max(hourlyTemp.slice(dayIndex * 24, dayIndex * 24 + 24))),
      temperature_2m_min: dailyTime.map((_, dayIndex) => min(hourlyTemp.slice(dayIndex * 24, dayIndex * 24 + 24))),
      precipitation_probability_max: dailyTime.map((_, dayIndex) => max(hourlyPrecipProb.slice(dayIndex * 24, dayIndex * 24 + 24))),
      uv_index_max: dailyTime.map((_, dayIndex) => max(hourlyUv.slice(dayIndex * 24, dayIndex * 24 + 24))),
      sunshine_duration: dailyTime.map((_, dayIndex) => sum(hourlySunshine.slice(dayIndex * 24, dayIndex * 24 + 24)))
    }
  };
}
