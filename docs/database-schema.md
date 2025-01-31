# Supabase Database Schema

## Tables

### restaurants
```sql
create table restaurants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,  -- Used in URL as restaurant-id
  logo_url text,
  address text,
  contact_email text not null,
  contact_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  active boolean default true
);

-- Enable RLS
alter table restaurants enable row level security;
```

### tables
```sql
create table tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  table_number text not null,
  status text default 'available' check (status in ('available', 'occupied', 'reserved')),
  qr_code_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(restaurant_id, table_number)
);

-- Enable RLS
alter table tables enable row level security;
```

### menu_categories
```sql
create table menu_categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table menu_categories enable row level security;
```

### menu_items
```sql
create table menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  is_available boolean default true,
  dietary_flags jsonb default '{}',  -- Store dietary information (vegan, vegetarian, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table menu_items enable row level security;
```

### orders
```sql
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

-- Enable RLS
alter table orders enable row level security;
```

### order_items
```sql
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table order_items enable row level security;
```

## Row Level Security (RLS) Policies

### restaurants
```sql
-- Allow restaurant owners to read their own restaurant
create policy "Restaurant owners can view own restaurant"
  on restaurants for select
  using (auth.email() = contact_email);

-- Allow public to read basic restaurant info
create policy "Public can view basic restaurant info"
  on restaurants for select
  using (true);
```

### tables
```sql
-- Allow restaurant staff to manage their tables
create policy "Restaurant staff can manage tables"
  on tables for all
  using (exists (
    select 1 from restaurants
    where restaurants.id = tables.restaurant_id
    and restaurants.contact_email = auth.email()
  ));

-- Allow public to view table status
create policy "Public can view table status"
  on tables for select
  using (true);
```

Similar policies will be created for other tables to ensure proper data isolation between restaurants.

## Indexes

```sql
-- Restaurants
create index idx_restaurants_slug on restaurants(slug);

-- Tables
create index idx_tables_restaurant on tables(restaurant_id);

-- Menu Items
create index idx_menu_items_restaurant on menu_items(restaurant_id);
create index idx_menu_items_category on menu_items(category_id);

-- Orders
create index idx_orders_restaurant on orders(restaurant_id);
create index idx_orders_table on orders(table_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);

-- Order Items
create index idx_order_items_order on order_items(order_id);
```

## Real-time Subscriptions

The following tables will have real-time enabled for live updates:
- tables (status changes)
- orders (new orders and status updates)
- menu_items (availability updates)

## Functions

We'll create the following database functions:
1. update_table_status() - Automatically updates table status based on active orders
2. calculate_order_total() - Calculates total amount for an order
3. check_menu_item_availability() - Validates item availability during order creation