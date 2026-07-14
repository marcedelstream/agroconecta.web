-- Precios ganaderos (PYG) y de commodities (USD) de prueba, para la seccion Precios.
-- Se puede correr mas de una vez sin duplicar (guard por label+market).

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'cattle', 'Novillo Gordo', 'Mercado Villeta', 'PYG', 'Gs/kg', 12850, 150, 1.18
where not exists (select 1 from market_prices where label = 'Novillo Gordo' and market = 'Mercado Villeta');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'cattle', 'Vaca Gorda', 'Mercado Villeta', 'PYG', 'Gs/kg', 11200, -50, -0.44
where not exists (select 1 from market_prices where label = 'Vaca Gorda' and market = 'Mercado Villeta');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'cattle', 'Vaquillona', 'Mercado Villeta', 'PYG', 'Gs/kg', 11800, 200, 1.72
where not exists (select 1 from market_prices where label = 'Vaquillona' and market = 'Mercado Villeta');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'cattle', 'Novillo de Invernada', 'Mercado San Pedro', 'PYG', 'Gs/kg', 10900, 80, 0.74
where not exists (select 1 from market_prices where label = 'Novillo de Invernada' and market = 'Mercado San Pedro');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'international', 'Soja', 'CBOT Chicago', 'USD', 'USD/ton', 385.50, 4.25, 1.11
where not exists (select 1 from market_prices where label = 'Soja' and market = 'CBOT Chicago');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'international', 'Maiz', 'CBOT Chicago', 'USD', 'USD/ton', 178.30, -2.10, -1.16
where not exists (select 1 from market_prices where label = 'Maiz' and market = 'CBOT Chicago');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'international', 'Trigo', 'CBOT Chicago', 'USD', 'USD/ton', 245.80, 3.50, 1.44
where not exists (select 1 from market_prices where label = 'Trigo' and market = 'CBOT Chicago');

insert into market_prices (kind, label, market, currency, unit, value, change, change_percent)
select 'international', 'Algodon', 'ICE Nueva York', 'USD', 'USD/lb', 0.72, -0.01, -1.37
where not exists (select 1 from market_prices where label = 'Algodon' and market = 'ICE Nueva York');
