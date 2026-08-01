-- FinTop DATA Supabase schema
-- Apply in Supabase SQL editor, then set auth users' app_metadata.role = 'admin'
-- for admin accounts.

create extension if not exists pgcrypto;

do $$
begin
    create type public.membership_tier as enum ('Standard', 'Pro', 'VIP', 'Diamond');
exception
    when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
    select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

create or replace function public.tier_rank(tier text)
returns integer
language sql
immutable
as $$
    select case tier
        when 'Standard' then 1
        when 'Pro' then 2
        when 'VIP' then 3
        when 'Diamond' then 4
        else 0
    end;
$$;

create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete set null,
    full_name text not null,
    email text,
    phone text,
    membership_tier public.membership_tier not null default 'Standard',
    status text not null default 'pending' check (status in ('active', 'pending', 'suspended', 'expired')),
    brokerage_account text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.stock_prices (
    ticker text primary key,
    exchange text,
    sector text,
    officer text,
    price numeric,
    open numeric,
    high numeric,
    low numeric,
    close numeric,
    volume numeric,
    change_pct numeric,
    model_desc text,
    model_status text,
    model_status_text text,
    trend text,
    delta_rsi varchar(50),
    validation_zone text,
    resistance_zone text,
    support_zone text,
    min_tier public.membership_tier not null default 'Standard',
    source text not null default 'DNT Quant Lab',
    synced_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.signals (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('ENTRY', 'EXIT')),
    ticker text not null,
    ticker_display text,
    badge text,
    badge_class text,
    expert_initials text,
    expert_avatar_bg text,
    expert_name text,
    expert_role text,
    signal_time text,
    signal_date text,
    buy_price text,
    sell_price text,
    order_status text,
    note text,
    details jsonb not null default '[]'::jsonb,
    min_tier public.membership_tier not null default 'Pro',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.research (
    id text primary key,
    section text not null,
    category text,
    title text not null,
    publish_time text,
    status text not null default 'Nháp',
    author text,
    excerpt text,
    link text,
    min_tier public.membership_tier not null default 'Standard',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
    id text primary key,
    name text not null,
    subtitle text,
    price text,
    cta text,
    status text not null default 'Đang mở',
    features text[] not null default '{}',
    popup_title text,
    popup_content text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.landing_content (
    id text primary key,
    section text not null,
    label text,
    value text,
    status text not null default 'Nháp',
    note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists stock_prices_set_updated_at on public.stock_prices;
create trigger stock_prices_set_updated_at before update on public.stock_prices
for each row execute function public.set_updated_at();

drop trigger if exists signals_set_updated_at on public.signals;
create trigger signals_set_updated_at before update on public.signals
for each row execute function public.set_updated_at();

drop trigger if exists research_set_updated_at on public.research;
create trigger research_set_updated_at before update on public.research
for each row execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at before update on public.memberships
for each row execute function public.set_updated_at();

drop trigger if exists landing_content_set_updated_at on public.landing_content;
create trigger landing_content_set_updated_at before update on public.landing_content
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.stock_prices enable row level security;
alter table public.signals enable row level security;
alter table public.research enable row level security;
alter table public.memberships enable row level security;
alter table public.landing_content enable row level security;

drop policy if exists "admin all customers" on public.customers;
create policy "admin all customers" on public.customers
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "member own customer row" on public.customers;
create policy "member own customer row" on public.customers
for select using (auth.uid() = auth_user_id);

drop policy if exists "admin all stock_prices" on public.stock_prices;
create policy "admin all stock_prices" on public.stock_prices
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "member read tier stock_prices" on public.stock_prices;
create policy "member read tier stock_prices" on public.stock_prices
for select using (
    exists (
        select 1 from public.customers c
        where c.auth_user_id = auth.uid()
          and c.status = 'active'
          and public.tier_rank(c.membership_tier::text) >= public.tier_rank(stock_prices.min_tier::text)
    )
);

drop policy if exists "admin all signals" on public.signals;
create policy "admin all signals" on public.signals
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "member read tier signals" on public.signals;
create policy "member read tier signals" on public.signals
for select using (
    exists (
        select 1 from public.customers c
        where c.auth_user_id = auth.uid()
          and c.status = 'active'
          and public.tier_rank(c.membership_tier::text) >= public.tier_rank(signals.min_tier::text)
    )
);

drop policy if exists "admin all research" on public.research;
create policy "admin all research" on public.research
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "member read tier research" on public.research;
create policy "member read tier research" on public.research
for select using (
    status = 'Đã đăng'
    and exists (
        select 1 from public.customers c
        where c.auth_user_id = auth.uid()
          and c.status = 'active'
          and public.tier_rank(c.membership_tier::text) >= public.tier_rank(research.min_tier::text)
    )
);

drop policy if exists "public read memberships" on public.memberships;
create policy "public read memberships" on public.memberships
for select using (true);

drop policy if exists "admin all memberships" on public.memberships;
create policy "admin all memberships" on public.memberships
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read landing_content" on public.landing_content;
create policy "public read landing_content" on public.landing_content
for select using (status = 'Đang dùng');

drop policy if exists "admin all landing_content" on public.landing_content;
create policy "admin all landing_content" on public.landing_content
for all using (public.is_admin()) with check (public.is_admin());
