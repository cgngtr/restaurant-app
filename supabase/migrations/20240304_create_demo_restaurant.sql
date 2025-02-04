-- Tüm tabloları temizle
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS restaurant_staff CASCADE;
DROP TABLE IF EXISTS restaurant_themes CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Ana tabloları oluştur
CREATE TABLE restaurants (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text not null UNIQUE,
    contact_email text not null UNIQUE,
    logo_url text,
    address text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    active boolean default true
);

CREATE TABLE restaurant_staff (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    email text not null UNIQUE,
    role text not null check (role in ('owner', 'manager', 'staff')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    active boolean default true
);

CREATE TABLE tables (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    table_number text not null,
    status text default 'available' check (status in ('available', 'occupied', 'reserved')),
    qr_code text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(restaurant_id, table_number)
);

CREATE TABLE menu_categories (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    name text not null,
    sort_order integer default 0,
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE menu_items (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    category_id uuid references menu_categories(id) on delete cascade,
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    is_available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE orders (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    table_id uuid references tables(id) on delete cascade,
    status text default 'pending' check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount decimal(10,2) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id) on delete cascade,
    menu_item_id uuid references menu_items(id) on delete cascade,
    quantity integer not null check (quantity > 0),
    unit_price decimal(10,2) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Demo Restaurant oluştur
INSERT INTO restaurants (name, slug, contact_email, logo_url, address, phone)
VALUES (
    'Demo Restaurant',
    'demo-restaurant',
    'demo@restaurant.com',
    'https://picsum.photos/200',
    'Demo Caddesi No:1, İstanbul',
    '+90 555 123 4567'
);

-- Restaurant Staff ekle
INSERT INTO restaurant_staff (restaurant_id, email, role)
SELECT id, 'demo@restaurant.com', 'owner'
FROM restaurants WHERE slug = 'demo-restaurant';

-- Demo Masaları ekle
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'demo-restaurant')
INSERT INTO tables (restaurant_id, table_number)
SELECT id, table_number
FROM rest CROSS JOIN (
    VALUES ('1'), ('2'), ('3'), ('4'), ('5'),
           ('A1'), ('A2'), ('A3'), ('B1'), ('B2')
) AS t(table_number);

-- Menü Kategorileri ekle
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'demo-restaurant')
INSERT INTO menu_categories (restaurant_id, name, sort_order)
SELECT id, name, sort_order
FROM rest CROSS JOIN (
    VALUES 
        ('Başlangıçlar', 1),
        ('Ana Yemekler', 2),
        ('Tatlılar', 3),
        ('İçecekler', 4)
) AS t(name, sort_order);

-- Menü Öğeleri ekle
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'demo-restaurant'),
     cats AS (SELECT id, name FROM menu_categories WHERE restaurant_id = (SELECT id FROM rest))
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available)
SELECT 
    (SELECT id FROM rest),
    cats.id,
    item_name,
    description,
    price,
    'https://picsum.photos/200',
    true
FROM cats CROSS JOIN (
    VALUES 
        ('Başlangıçlar', 'Mercimek Çorbası', 'Geleneksel mercimek çorbası', 45.00),
        ('Başlangıçlar', 'Salata', 'Mevsim yeşillikleri', 55.00),
        ('Ana Yemekler', 'Izgara Köfte', 'Özel baharatlı köfte', 120.00),
        ('Ana Yemekler', 'Tavuk Şiş', 'Marine edilmiş tavuk', 100.00),
        ('Tatlılar', 'Sütlaç', 'Geleneksel sütlaç', 45.00),
        ('Tatlılar', 'Baklava', 'Antep fıstıklı baklava', 65.00),
        ('İçecekler', 'Kola', 'Soğuk içecek', 25.00),
        ('İçecekler', 'Ayran', 'Taze ayran', 20.00)
) AS t(category_name, item_name, description, price)
WHERE cats.name = category_name;

-- Örnek sipariş ekle
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'demo-restaurant'),
     table_data AS (SELECT id FROM tables WHERE restaurant_id = (SELECT id FROM rest) AND table_number = '1'),
     order_data AS (
        INSERT INTO orders (restaurant_id, table_id, status, total_amount, notes)
        SELECT rest.id, table_data.id, 'pending', 185.00, 'Test siparişi'
        FROM rest, table_data
        RETURNING id
     )
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
SELECT 
    order_data.id,
    menu_items.id,
    2,
    menu_items.price
FROM order_data, menu_items
WHERE menu_items.name = 'Izgara Köfte';