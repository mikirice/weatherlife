create extension if not exists pgcrypto;

create table if not exists weather_cache (
  id uuid primary key default gen_random_uuid(),
  lat_rounded numeric(4, 1) not null,
  lon_rounded numeric(5, 1) not null,
  data jsonb not null,
  indices jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (lat_rounded, lon_rounded)
);

create index if not exists idx_weather_cache_location on weather_cache (lat_rounded, lon_rounded);
create index if not exists idx_weather_cache_expires on weather_cache (expires_at);

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug varchar(100) unique not null,
  name varchar(200) not null,
  lat numeric(6, 3) not null,
  lon numeric(7, 3) not null,
  country_code char(2) not null,
  timezone varchar(50) not null,
  population integer
);
