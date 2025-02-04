-- Tüm tabloları sil
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS restaurant_staff CASCADE;
DROP TABLE IF EXISTS restaurant_themes CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Restaurants tablosunu oluştur
CREATE TABLE restaurants (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text not null UNIQUE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Demo restaurant ekle
INSERT INTO restaurants (name, slug)
VALUES ('Demo Restaurant', 'demo-restaurant');

-- Masalar tablosunu oluştur
CREATE TABLE tables (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    table_number text not null,
    status text default 'available',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(restaurant_id, table_number)
);

-- Demo masaları ekle
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'demo-restaurant')
INSERT INTO tables (restaurant_id, table_number)
SELECT id, table_number
FROM rest CROSS JOIN (
    VALUES ('1'), ('2'), ('3'), ('4'), ('5'),
           ('A1'), ('A2'), ('A3'), ('B1'), ('B2')
) AS t(table_number); 