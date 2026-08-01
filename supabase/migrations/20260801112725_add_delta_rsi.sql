alter table public.stock_prices
add column if not exists delta_rsi varchar(50);
