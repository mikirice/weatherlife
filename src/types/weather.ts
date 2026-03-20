export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  generationtime_ms?: number;
  elevation?: number;
  current_units?: Record<string, string>;
  hourly_units?: Record<string, string>;
  daily_units?: Record<string, string>;
  current: {
    interval?: number;
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation_probability: number;
    weather_code: number;
    cloud_cover: number;
    uv_index: number;
    is_day: number;
    visibility?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    cloud_cover: number[];
    visibility: number[];
    uv_index: number[];
    shortwave_radiation: number[];
    sunshine_duration: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunshine_duration: number[];
  };
}

export interface CurrentConditions {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  weatherCode: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  isDay: boolean;
}

export interface HourlyForecastItem {
  time: string;
  displayTime: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  uvIndex: number;
  isDay: boolean;
}

export interface HourlyWeatherPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  weatherCode: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  sunshineDuration: number;
  isDay: boolean;
}

export interface DailyWeatherSummary {
  date: string;
  minTemperature: number;
  maxTemperature: number;
  averageTemperature: number;
  averageHumidity: number;
  averageWindSpeed: number;
  maxPrecipitationProbability: number;
  maxUvIndex: number;
  sunshineHours: number;
  temperatureRange: number;
  representativeWeatherCode: number;
}

export interface DayWeatherSnapshot {
  date: string;
  current: CurrentConditions;
  night: Pick<CurrentConditions, "cloudCover" | "visibility" | "weatherCode" | "isDay">;
  summary: DailyWeatherSummary;
}

export interface WeatherSnapshot {
  current: CurrentConditions;
  summary: DailyWeatherSummary;
  hourly: HourlyForecastItem[];
  hourlyPoints: HourlyWeatherPoint[];
  daily: DayWeatherSnapshot[];
  raw: OpenMeteoForecastResponse;
}

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  current_units?: Record<string, string>;
  current: {
    time: string;
    interval?: number;
    birch_pollen?: number;
    grass_pollen?: number;
    alder_pollen?: number;
    ragweed_pollen?: number;
    olive_pollen?: number;
    mugwort_pollen?: number;
  };
}

export interface PollenSummary {
  upi: number;
  inSeason: boolean;
  category: string;
  available: boolean;
  raw?: OpenMeteoAirQualityResponse | null;
}
