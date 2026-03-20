import { beerIndex } from "@/lib/indices/beer";
import { carWashIndex } from "@/lib/indices/car-wash";
import { clothingIndex } from "@/lib/indices/clothing";
import { coldRiskIndex } from "@/lib/indices/cold-risk";
import { comfortIndex } from "@/lib/indices/comfort";
import { exerciseIndex } from "@/lib/indices/exercise";
import { heatingCoolingIndex } from "@/lib/indices/heating-cooling";
import { iceCreamIndex } from "@/lib/indices/ice-cream";
import { laundryIndex } from "@/lib/indices/laundry";
import { nabeIndex } from "@/lib/indices/nabe";
import { pipeFreezingIndex } from "@/lib/indices/pipe-freezing";
import { pollenIndex } from "@/lib/indices/pollen";
import { skinDrynessIndex } from "@/lib/indices/skin-dryness";
import { stargazingIndex } from "@/lib/indices/stargazing";
import { umbrellaIndex } from "@/lib/indices/umbrella";
import { uvIndexScore } from "@/lib/indices/uv";
import type { LifeIndexInput, LifeIndexMeta, LifeIndices } from "@/types";

export const freeIndexMeta: LifeIndexMeta[] = [
  { key: "clothing", title: "Clothing", icon: "👕", direction: "neutral", tier: "free" },
  { key: "umbrella", title: "Umbrella", icon: "☂️", direction: "lower", tier: "free" },
  { key: "pollen", title: "Pollen", icon: "👃", direction: "lower", tier: "free" },
  { key: "laundry", title: "Laundry", icon: "🧺", direction: "higher", tier: "free" },
  { key: "uv", title: "UV Index", icon: "☀️", direction: "lower", tier: "free" },
  { key: "coldRisk", title: "Cold Risk", icon: "😷", direction: "lower", tier: "free" },
  { key: "exercise", title: "Exercise", icon: "🏃", direction: "higher", tier: "free" },
  { key: "comfort", title: "Comfort", icon: "💧", direction: "higher", tier: "free" }
];

export const proIndexMeta: LifeIndexMeta[] = [
  { key: "stargazing", title: "Stargazing", icon: "🌟", direction: "higher", tier: "pro" },
  { key: "carWash", title: "Car Wash", icon: "🚗", direction: "higher", tier: "pro" },
  { key: "skinDryness", title: "Skin Dryness", icon: "🧴", direction: "lower", tier: "pro" },
  { key: "pipeFreezing", title: "Pipe Freezing", icon: "🧊", direction: "lower", tier: "pro" },
  { key: "heatingCooling", title: "Heating/Cooling", icon: "🏠", direction: "neutral", tier: "pro" },
  { key: "nabe", title: "Nabe", icon: "🍲", direction: "higher", tier: "pro" },
  { key: "beer", title: "Beer", icon: "🍺", direction: "higher", tier: "pro" },
  { key: "iceCream", title: "Ice Cream", icon: "🍨", direction: "higher", tier: "pro" }
];

export const lifeIndexMeta: LifeIndexMeta[] = [...freeIndexMeta, ...proIndexMeta];

export function calculateAllIndices(input: LifeIndexInput): LifeIndices {
  return {
    clothing: clothingIndex(input.current.apparentTemperature),
    umbrella: umbrellaIndex(
      input.summary.maxPrecipitationProbability,
      input.summary.representativeWeatherCode
    ),
    laundry: laundryIndex(
      input.summary.averageTemperature,
      input.summary.averageHumidity,
      input.summary.averageWindSpeed,
      input.summary.maxPrecipitationProbability,
      input.summary.sunshineHours
    ),
    pollen: pollenIndex(input.pollen.upi, input.pollen.inSeason, input.pollen.available),
    uv: uvIndexScore(input.summary.maxUvIndex),
    coldRisk: coldRiskIndex(
      input.current.temperature,
      input.current.humidity,
      input.summary.temperatureRange
    ),
    exercise: exerciseIndex(
      input.current.apparentTemperature,
      input.summary.maxPrecipitationProbability,
      input.current.windSpeed,
      input.current.uvIndex
    ),
    comfort: comfortIndex(input.current.apparentTemperature, input.current.humidity),
    stargazing: stargazingIndex(input.night.cloudCover, input.night.visibility, input.date),
    carWash: carWashIndex(input.next48HourRainProbability),
    skinDryness: skinDrynessIndex(input.current.humidity, input.current.windSpeed),
    pipeFreezing: pipeFreezingIndex(input.summary.minTemperature),
    heatingCooling: heatingCoolingIndex(input.summary.averageTemperature),
    nabe: nabeIndex(input.date, input.summary.averageTemperature, input.summary.averageHumidity),
    beer: beerIndex(input.date, input.summary.averageTemperature, input.summary.averageHumidity),
    iceCream: iceCreamIndex(input.date, input.summary.averageTemperature, input.summary.sunshineHours)
  };
}

export {
  beerIndex,
  carWashIndex,
  clothingIndex,
  coldRiskIndex,
  comfortIndex,
  exerciseIndex,
  heatingCoolingIndex,
  iceCreamIndex,
  laundryIndex,
  nabeIndex,
  pipeFreezingIndex,
  pollenIndex,
  skinDrynessIndex,
  stargazingIndex,
  umbrellaIndex,
  uvIndexScore
};
