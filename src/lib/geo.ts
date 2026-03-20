import { cities } from "@/lib/cities";
import type { City } from "@/types";

export function roundCoordinate(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundCoordinates(lat: number, lon: number) {
  return {
    lat: roundCoordinate(lat),
    lon: roundCoordinate(lon)
  };
}

export function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestCity(lat: number, lon: number): City {
  let closest = cities[0];
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const city of cities) {
    const distance = distanceInKm(lat, lon, city.lat, city.lon);
    if (distance < closestDistance) {
      closest = city;
      closestDistance = distance;
    }
  }

  return closest;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
