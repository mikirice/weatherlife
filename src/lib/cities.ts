import type { City } from "@/types";

export const cities: City[] = [
  { slug: "tokyo", name: "Tokyo", lat: 35.676, lon: 139.650, country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", population: 13960000 },
  { slug: "osaka", name: "Osaka", lat: 34.693, lon: 135.502, country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", population: 2750000 },
  { slug: "seoul", name: "Seoul", lat: 37.566, lon: 126.978, country: "South Korea", countryCode: "KR", timezone: "Asia/Seoul", population: 9500000 },
  { slug: "beijing", name: "Beijing", lat: 39.904, lon: 116.407, country: "China", countryCode: "CN", timezone: "Asia/Shanghai", population: 21890000 },
  { slug: "shanghai", name: "Shanghai", lat: 31.230, lon: 121.473, country: "China", countryCode: "CN", timezone: "Asia/Shanghai", population: 24870000 },
  { slug: "hong-kong", name: "Hong Kong", lat: 22.319, lon: 114.169, country: "Hong Kong", countryCode: "HK", timezone: "Asia/Hong_Kong", population: 7410000 },
  { slug: "singapore", name: "Singapore", lat: 1.352, lon: 103.820, country: "Singapore", countryCode: "SG", timezone: "Asia/Singapore", population: 5918000 },
  { slug: "bangkok", name: "Bangkok", lat: 13.756, lon: 100.501, country: "Thailand", countryCode: "TH", timezone: "Asia/Bangkok", population: 10540000 },
  { slug: "taipei", name: "Taipei", lat: 25.033, lon: 121.565, country: "Taiwan", countryCode: "TW", timezone: "Asia/Taipei", population: 2490000 },
  { slug: "delhi", name: "Delhi", lat: 28.614, lon: 77.209, country: "India", countryCode: "IN", timezone: "Asia/Kolkata", population: 32900000 },
  { slug: "mumbai", name: "Mumbai", lat: 19.076, lon: 72.878, country: "India", countryCode: "IN", timezone: "Asia/Kolkata", population: 12440000 },
  { slug: "dubai", name: "Dubai", lat: 25.204, lon: 55.270, country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai", population: 3560000 },
  { slug: "istanbul", name: "Istanbul", lat: 41.008, lon: 28.978, country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", population: 15640000 },
  { slug: "london", name: "London", lat: 51.507, lon: -0.128, country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", population: 8982000 },
  { slug: "paris", name: "Paris", lat: 48.857, lon: 2.352, country: "France", countryCode: "FR", timezone: "Europe/Paris", population: 2161000 },
  { slug: "berlin", name: "Berlin", lat: 52.520, lon: 13.405, country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", population: 3645000 },
  { slug: "madrid", name: "Madrid", lat: 40.417, lon: -3.704, country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", population: 3223000 },
  { slug: "rome", name: "Rome", lat: 41.902, lon: 12.496, country: "Italy", countryCode: "IT", timezone: "Europe/Rome", population: 2873000 },
  { slug: "amsterdam", name: "Amsterdam", lat: 52.367, lon: 4.904, country: "Netherlands", countryCode: "NL", timezone: "Europe/Amsterdam", population: 921000 },
  { slug: "stockholm", name: "Stockholm", lat: 59.329, lon: 18.069, country: "Sweden", countryCode: "SE", timezone: "Europe/Stockholm", population: 975000 },
  { slug: "helsinki", name: "Helsinki", lat: 60.170, lon: 24.938, country: "Finland", countryCode: "FI", timezone: "Europe/Helsinki", population: 658000 },
  { slug: "moscow", name: "Moscow", lat: 55.756, lon: 37.617, country: "Russia", countryCode: "RU", timezone: "Europe/Moscow", population: 13010000 },
  { slug: "cairo", name: "Cairo", lat: 30.044, lon: 31.236, country: "Egypt", countryCode: "EG", timezone: "Africa/Cairo", population: 10230000 },
  { slug: "johannesburg", name: "Johannesburg", lat: -26.204, lon: 28.047, country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", population: 5635000 },
  { slug: "lagos", name: "Lagos", lat: 6.524, lon: 3.379, country: "Nigeria", countryCode: "NG", timezone: "Africa/Lagos", population: 15300000 },
  { slug: "nairobi", name: "Nairobi", lat: -1.286, lon: 36.817, country: "Kenya", countryCode: "KE", timezone: "Africa/Nairobi", population: 4397000 },
  { slug: "sydney", name: "Sydney", lat: -33.868, lon: 151.209, country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", population: 5312000 },
  { slug: "melbourne", name: "Melbourne", lat: -37.814, lon: 144.963, country: "Australia", countryCode: "AU", timezone: "Australia/Melbourne", population: 5078000 },
  { slug: "auckland", name: "Auckland", lat: -36.850, lon: 174.764, country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", population: 1657000 },
  { slug: "honolulu", name: "Honolulu", lat: 21.307, lon: -157.858, country: "United States", countryCode: "US", timezone: "Pacific/Honolulu", population: 345000 },
  { slug: "los-angeles", name: "Los Angeles", lat: 34.052, lon: -118.244, country: "United States", countryCode: "US", timezone: "America/Los_Angeles", population: 3821000 },
  { slug: "san-francisco", name: "San Francisco", lat: 37.775, lon: -122.419, country: "United States", countryCode: "US", timezone: "America/Los_Angeles", population: 808000 },
  { slug: "vancouver", name: "Vancouver", lat: 49.282, lon: -123.121, country: "Canada", countryCode: "CA", timezone: "America/Vancouver", population: 675000 },
  { slug: "seattle", name: "Seattle", lat: 47.606, lon: -122.332, country: "United States", countryCode: "US", timezone: "America/Los_Angeles", population: 755000 },
  { slug: "chicago", name: "Chicago", lat: 41.878, lon: -87.630, country: "United States", countryCode: "US", timezone: "America/Chicago", population: 2746000 },
  { slug: "toronto", name: "Toronto", lat: 43.653, lon: -79.383, country: "Canada", countryCode: "CA", timezone: "America/Toronto", population: 2732000 },
  { slug: "new-york", name: "New York", lat: 40.713, lon: -74.006, country: "United States", countryCode: "US", timezone: "America/New_York", population: 8804000 },
  { slug: "boston", name: "Boston", lat: 42.360, lon: -71.059, country: "United States", countryCode: "US", timezone: "America/New_York", population: 654000 },
  { slug: "washington-dc", name: "Washington, D.C.", lat: 38.907, lon: -77.037, country: "United States", countryCode: "US", timezone: "America/New_York", population: 689000 },
  { slug: "miami", name: "Miami", lat: 25.762, lon: -80.192, country: "United States", countryCode: "US", timezone: "America/New_York", population: 442000 },
  { slug: "mexico-city", name: "Mexico City", lat: 19.433, lon: -99.133, country: "Mexico", countryCode: "MX", timezone: "America/Mexico_City", population: 9209000 },
  { slug: "sao-paulo", name: "Sao Paulo", lat: -23.555, lon: -46.639, country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", population: 11450000 },
  { slug: "buenos-aires", name: "Buenos Aires", lat: -34.604, lon: -58.382, country: "Argentina", countryCode: "AR", timezone: "America/Argentina/Buenos_Aires", population: 3076000 },
  { slug: "santiago", name: "Santiago", lat: -33.448, lon: -70.669, country: "Chile", countryCode: "CL", timezone: "America/Santiago", population: 6257000 },
  { slug: "lima", name: "Lima", lat: -12.046, lon: -77.043, country: "Peru", countryCode: "PE", timezone: "America/Lima", population: 9752000 },
  { slug: "bogota", name: "Bogota", lat: 4.711, lon: -74.072, country: "Colombia", countryCode: "CO", timezone: "America/Bogota", population: 7968000 },
  { slug: "reykjavik", name: "Reykjavik", lat: 64.146, lon: -21.942, country: "Iceland", countryCode: "IS", timezone: "Atlantic/Reykjavik", population: 140000 },
  { slug: "lisbon", name: "Lisbon", lat: 38.722, lon: -9.139, country: "Portugal", countryCode: "PT", timezone: "Europe/Lisbon", population: 545000 },
  { slug: "zurich", name: "Zurich", lat: 47.376, lon: 8.541, country: "Switzerland", countryCode: "CH", timezone: "Europe/Zurich", population: 443000 },
  { slug: "vienna", name: "Vienna", lat: 48.208, lon: 16.373, country: "Austria", countryCode: "AT", timezone: "Europe/Vienna", population: 2000000 }
];

export const citiesBySlug = new Map(cities.map((city) => [city.slug, city]));

export function getCityBySlug(slug: string) {
  return citiesBySlug.get(slug);
}

export function searchCities(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return cities;
  }

  return cities.filter((city) => {
    const haystack = `${city.name} ${city.country} ${city.slug}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
