-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create tables
create table restaurants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  address text,
  contact_email text not null,
  contact_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  active boolean default true
);

create table tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  table_number text not null,
  status text default 'available' check (status in ('available', 'occupied', 'reserved')),
  qr_code_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(restaurant_id, table_number)
);

create table menu_categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  is_available boolean default true,
  dietary_flags jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  table_id uuid references tables(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount decimal(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table restaurants enable row level security;
alter table tables enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Create RLS Policies

-- Restaurants
create policy "Restaurant owners can view own restaurant"
  on restaurants for select
  using (auth.email() = contact_email);

create policy "Public can view basic restaurant info"
  on restaurants for select
  using (true);

-- Tables
create policy "Restaurant staff can manage tables"
  on tables for all
  using (exists (
    select 1 from restaurants
    where restaurants.id = tables.restaurant_id
    and restaurants.contact_email = auth.email()
  ));

create policy "Public can view table status"
  on tables for select
  using (true);

-- Menu Categories
create policy "Restaurant staff can manage menu categories"
  on menu_categories for all
  using (exists (
    select 1 from restaurants
    where restaurants.id = menu_categories.restaurant_id
    and restaurants.contact_email = auth.email()
  ));

create policy "Public can view menu categories"
  on menu_categories for select
  using (true);

-- Menu Items
create policy "Restaurant staff can manage menu items"
  on menu_items for all
  using (exists (
    select 1 from restaurants
    where restaurants.id = menu_items.restaurant_id
    and restaurants.contact_email = auth.email()
  ));

create policy "Public can view menu items"
  on menu_items for select
  using (true);

-- Orders
create policy "Restaurant staff can manage orders"
  on orders for all
  using (exists (
    select 1 from restaurants
    where restaurants.id = orders.restaurant_id
    and restaurants.contact_email = auth.email()
  ));

create policy "Public can create and view own orders"
  on orders for insert
  with check (true);

-- Order Items
create policy "Restaurant staff can view order items"
  on order_items for select
  using (exists (
    select 1 from restaurants
    where restaurants.id = (
      select restaurant_id from orders where orders.id = order_items.order_id
    )
    and restaurants.contact_email = auth.email()
  ));

create policy "Public can create order items"
  on order_items for insert
  with check (true);

-- Create Indexes
create index idx_restaurants_slug on restaurants(slug);
create index idx_tables_restaurant on tables(restaurant_id);
create index idx_menu_items_restaurant on menu_items(restaurant_id);
create index idx_menu_items_category on menu_items(category_id);
create index idx_orders_restaurant on orders(restaurant_id);
create index idx_orders_table on orders(table_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);
create index idx_order_items_order on order_items(order_id);

-- Enable Real-time
alter publication supabase_realtime add table tables;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table menu_items; 