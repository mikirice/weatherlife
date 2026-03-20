create table if not exists profiles (
  id uuid primary key references auth.users(id),
  saved_locations jsonb default '[]',
  preferences jsonb default '{}',
  plan varchar(20) default 'free',
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255) unique,
  status varchar(20) not null,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_subscriptions_user_id on subscriptions (user_id);
create index if not exists idx_subscriptions_customer_id on subscriptions (stripe_customer_id);
