-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in order of dependencies
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, profile_id)
);

CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sort_order INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    parent_id UUID REFERENCES menu_categories(id),
    category_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customization_options JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customization_groups table
CREATE TABLE IF NOT EXISTS customization_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    type_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customization_options table
CREATE TABLE IF NOT EXISTS customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES customization_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dietary_flags table
CREATE TABLE IF NOT EXISTS dietary_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_restaurant_staff_profile ON restaurant_staff(profile_id);
CREATE INDEX idx_restaurant_staff_restaurant ON restaurant_staff(restaurant_id);
CREATE INDEX idx_restaurant_slug ON restaurants(slug);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX idx_customization_groups_restaurant ON customization_groups(restaurant_id);
CREATE INDEX idx_customization_options_group ON customization_options(group_id);
CREATE INDEX idx_dietary_flags_restaurant ON dietary_flags(restaurant_id);

-- Seed initial data
INSERT INTO restaurants (id, name, slug, logo_url, address, contact_email, contact_phone, created_at, active) 
VALUES (
    '2f3c2e2e-6166-4f32-a0d9-6083548cac83',
    'Brew & Bite',
    'brew-and-bite',
    'https://example.com/logos/brew-and-bite.png',
    'Bağdat Caddesi No:42, Kadıköy, İstanbul',
    'cgngtr1014@hotmail.com',
    '+90 216 555 4242',
    '2025-02-04 20:22:01.953457+00',
    true
);

INSERT INTO profiles (id, email, role, created_at, updated_at) 
VALUES (
    '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
    'cgngtr1014@hotmail.com',
    'restaurant_owner',
    '2025-02-09 01:09:27.433435+00',
    '2025-02-09 01:09:27.433435+00'
);

INSERT INTO restaurant_staff (restaurant_id, profile_id, role)
VALUES (
    '2f3c2e2e-6166-4f32-a0d9-6083548cac83',
    '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
    'owner'
);

-- Seed tables
INSERT INTO tables (id, restaurant_id, table_number, status, qr_code, created_at) 
VALUES
    ('ed67d80b-b446-4d02-98fc-ace71a294bbd', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'T1', 'available', NULL, '2025-02-04 20:22:01.953457+00'),
    ('b1b472f8-82b9-40c0-97b0-0c19b07947d8', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'T2', 'available', NULL, '2025-02-04 20:22:01.953457+00'),
    ('11c731c0-9e5a-4e9e-8442-eb995ccf7d96', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'T3', 'available', NULL, '2025-02-04 20:22:01.953457+00'),
    ('b6827a9e-82be-4714-88d0-35d542c9a02e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'T4', 'available', NULL, '2025-02-04 20:22:01.953457+00'),
    ('6c6d2105-b0af-48eb-a349-aee847328e0e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'T5', 'available', NULL, '2025-02-04 20:22:01.953457+00');

-- Seed menu categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order, active, created_at, parent_id, category_type) 
VALUES
    ('278f0ff3-41c8-4d90-9447-75518530f43b', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Hot Beverages', 1, true, '2025-02-04 20:22:01.953457+00', NULL, NULL),
    ('877b8874-abdc-47a1-bfa1-9272e70c79ed', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Cold Beverages', 2, true, '2025-02-04 20:22:01.953457+00', NULL, NULL),
    ('f1752e24-fbb4-4474-a9c4-26ffdabb439a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Desserts', 3, true, '2025-02-04 20:22:01.953457+00', NULL, NULL),
    ('8f63a9e1-9aed-4f6f-b0c9-25522c4e1f4a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Sandwiches', 4, true, '2025-02-04 20:22:01.953457+00', NULL, NULL),
    ('16004490-bfef-4f93-8b76-51d7c22f5fed', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Snacks', 5, true, '2025-02-04 20:22:01.953457+00', NULL, NULL);

-- Seed menu items (one for each category)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, created_at, customization_options) 
VALUES
    ('67a4c926-0478-4c9d-accb-1c019abc2d50', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '278f0ff3-41c8-4d90-9447-75518530f43b', 'Latte', 'Espresso, süt ve üzerine az miktarda süt köpüğü dokunuşuyla tamamladığımız özel lezzetimiz.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/latte.jpg', true, '2025-02-06 16:56:55.261679+00', '{"type": "coffee", "sizes": {"Large": 1, "Small": 0, "Medium": 0.5}, "milk_options": {"Oat Milk": 0.8, "Soy Milk": 0.8, "Skim Milk": 0, "Whole Milk": 0, "Almond Milk": 0.8}}'::jsonb),
    ('22179f00-2346-4253-aeaa-89d4f1011daa', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '877b8874-abdc-47a1-bfa1-9272e70c79ed', 'Buzlu Latte', 'Nefis lattemizi hem canlanmak hem de serinlemek için tercih edenlere özel.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/buzlu-latte.jpg', true, '2025-02-06 16:56:55.237538+00', '{}'::jsonb),
    ('10b2df87-6f4b-48d1-948a-ab51efd122ad', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'f1752e24-fbb4-4474-a9c4-26ffdabb439a', 'Fındıklı Cookie', 'Hem çikolata hem fındık parçacıklarıyla bambaşka bir lezzet dünyasına açılan enfes cookie lezzetimiz.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/findikli-cookie.jpg', true, '2025-02-06 16:56:55.252482+00', '{}'::jsonb),
    ('035e0f89-66f8-459c-8615-8aba38505ebc', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '8f63a9e1-9aed-4f6f-b0c9-25522c4e1f4a', 'Ezine Peynirli Foccacia Sandviç', 'Deneyen herkesin hayran kaldığı nefis İtalyan foccacia ekmeğinin efsane ezine peyniriyle eşsiz buluşması.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/ezine-peynirli-foccacia-sandvic.jpg', true, '2025-02-06 16:56:55.25088+00', '{}'::jsonb),
    ('0441762d-1b23-43c4-8136-bca9a3f86b32', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '16004490-bfef-4f93-8b76-51d7c22f5fed', 'Dereotlu Ev Poğaçası', 'Tadına doyum olmayan nefis poğaça ve dereotunun muhteşem buluşması.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/dereotlu-ev-pogacasi.jpg', true, '2025-02-06 16:56:55.24687+00', '{}'::jsonb);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_flags ENABLE ROW LEVEL SECURITY;

-- Create unified policies for authenticated users
CREATE POLICY "restaurant_access_policy"
ON restaurants
FOR ALL
TO authenticated
USING (
    id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
    OR
    contact_email = auth.email()
);

CREATE POLICY "profile_access_policy"
ON profiles
FOR ALL
TO authenticated
USING (
    id = auth.uid()
);

CREATE POLICY "restaurant_staff_access_policy"
ON restaurant_staff
FOR ALL
TO authenticated
USING (
    profile_id = auth.uid()
);

CREATE POLICY "tables_access_policy"
ON tables
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "menu_categories_access_policy"
ON menu_categories
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "menu_items_access_policy"
ON menu_items
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "orders_access_policy"
ON orders
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "order_items_access_policy"
ON order_items
FOR ALL
TO authenticated
USING (
    order_id IN (
        SELECT id 
        FROM orders 
        WHERE restaurant_id IN (
            SELECT restaurant_id 
            FROM restaurant_staff 
            WHERE profile_id = auth.uid()
        )
    )
);

-- Create public read-only policies
CREATE POLICY "public_restaurant_access"
ON restaurants
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_tables_access"
ON tables
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_menu_categories_access"
ON menu_categories
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_menu_items_access"
ON menu_items
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_orders_access"
ON orders
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_order_items_access"
ON order_items
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

CREATE POLICY "tables_public_access_policy"
ON tables
FOR SELECT
TO anon
USING (true);

-- Create policies for customization_groups
CREATE POLICY "customization_groups_access_policy"
ON customization_groups
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "public_customization_groups_access"
ON customization_groups
FOR SELECT
TO anon
USING (true);

-- Create policies for customization_options
CREATE POLICY "customization_options_access_policy"
ON customization_options
FOR ALL
TO authenticated
USING (
    group_id IN (
        SELECT id 
        FROM customization_groups 
        WHERE restaurant_id IN (
            SELECT restaurant_id 
            FROM restaurant_staff 
            WHERE profile_id = auth.uid()
        )
    )
);

CREATE POLICY "public_customization_options_access"
ON customization_options
FOR SELECT
TO anon
USING (true);

-- Create policies for dietary_flags
CREATE POLICY "dietary_flags_access_policy"
ON dietary_flags
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "public_dietary_flags_access"
ON dietary_flags
FOR SELECT
TO anon
USING (true); 