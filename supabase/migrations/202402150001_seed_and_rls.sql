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

-- Seed menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, created_at, customization_options) 
VALUES
    ('67a4c926-0478-4c9d-accb-1c019abc2d50', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '278f0ff3-41c8-4d90-9447-75518530f43b', 'Latte', 'Espresso, süt ve üzerine az miktarda süt köpüğü dokunuşuyla tamamladığımız özel lezzetimiz.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/latte.jpg', true, '2025-02-06 16:56:55.261679+00', '{"type": "coffee", "sizes": {"Large": 1, "Small": 0, "Medium": 0.5}, "milk_options": {"Oat Milk": 0.8, "Soy Milk": 0.8, "Skim Milk": 0, "Whole Milk": 0, "Almond Milk": 0.8}}'::jsonb),
    ('22179f00-2346-4253-aeaa-89d4f1011daa', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '877b8874-abdc-47a1-bfa1-9272e70c79ed', 'Buzlu Latte', 'Nefis lattemizi hem canlanmak hem de serinlemek için tercih edenlere özel.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/buzlu-latte.jpg', true, '2025-02-06 16:56:55.237538+00', '{}'::jsonb),
    ('10b2df87-6f4b-48d1-948a-ab51efd122ad', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'f1752e24-fbb4-4474-a9c4-26ffdabb439a', 'Fındıklı Cookie', 'Hem çikolata hem fındık parçacıklarıyla bambaşka bir lezzet dünyasına açılan enfes cookie lezzetimiz.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/findikli-cookie.jpg', true, '2025-02-06 16:56:55.252482+00', '{}'::jsonb),
    ('035e0f89-66f8-459c-8615-8aba38505ebc', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '8f63a9e1-9aed-4f6f-b0c9-25522c4e1f4a', 'Ezine Peynirli Foccacia Sandviç', 'Deneyen herkesin hayran kaldığı nefis İtalyan foccacia ekmeğinin efsane ezine peyniriyle eşsiz buluşması.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/ezine-peynirli-foccacia-sandvic.jpg', true, '2025-02-06 16:56:55.25088+00', '{}'::jsonb),
    ('0441762d-1b23-43c4-8136-bca9a3f86b32', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '16004490-bfef-4f93-8b76-51d7c22f5fed', 'Dereotlu Ev Poğaçası', 'Tadına doyum olmayan nefis poğaça ve dereotunun muhteşem buluşması.', 65.00, 'https://fzzwrqhsyjuzyngcruhn.supabase.co/storage/v1/object/public/menu-images/dereotlu-ev-pogacasi.jpg', true, '2025-02-06 16:56:55.24687+00', '{}'::jsonb);

-- Seed dietary flags
INSERT INTO dietary_flags (id, restaurant_id, name, description, icon_url, created_at) VALUES
('07c245a5-be7a-467d-8c64-0ee3fccebaad', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Spicy', 'Hot and spicy', 'https://api.iconify.design/mdi:chili-hot.svg?color=%23b91c1c', '2025-02-05 11:22:09.057762+00'),
('15116947-f2a9-4491-99fa-3dc59c7d5e5e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Soy Free', 'Contains no soy', 'https://api.iconify.design/mdi:soy-sauce-off.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('1bd4fb37-4ebd-4fc5-8d20-03fd0d543a6a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Shellfish Free', 'No shellfish', 'https://api.iconify.design/game-icons:shrimp.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('1dc1de74-c84c-41ad-bba4-3fe7b07b5ddc', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Mustard Free', 'Contains no mustard', 'https://api.iconify.design/fluent:drink-bottle-off-20-filled.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('41d61e11-6454-4041-9491-66e2771f2d80', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Dairy Free', 'Contains no dairy products', 'https://api.iconify.design/mdi:cow-off.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('5a4cec32-7566-46ed-9255-669543bb0572', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Sugar Free', 'Contains no sugar', 'https://api.iconify.design/material-symbols:cookie-off.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('661d132c-2780-4433-90eb-6c65f96ddca5', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Vegan', 'Contains no animal products', 'https://api.iconify.design/mdi:sprout.svg?color=%2322c55e', '2025-02-05 11:22:09.057762+00'),
('8331b7b4-da92-4d16-ad08-bcb1c756762c', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Halal', 'Halal certified', 'https://api.iconify.design/material-symbols:check-circle.svg?color=%2322c55e', '2025-02-05 11:22:09.057762+00'),
('9b339e00-c878-47f7-a82a-97ef9bbe182a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Nut Free', 'No nuts or tree nuts', 'https://api.iconify.design/game-icons:peanut.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('a4b5fcd7-0ff9-4e72-b415-7973255a12b5', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Kosher', 'Kosher certified', 'https://api.iconify.design/material-symbols:star.svg?color=%2322c55e', '2025-02-05 11:22:09.057762+00'),
('a8e85b55-5d8f-47a3-b8b4-5ea5970ac3ec', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Alcohol Free', 'Contains no alcohol', 'https://api.iconify.design/material-symbols:no-drinks.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('e13d5f3b-9ecc-4258-94e8-3426ef9389c7', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Egg Free', 'Contains no eggs', 'https://api.iconify.design/mdi:egg-off.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('e709b78f-bbf5-4cf4-956a-b7c3c064e050', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Gluten Free', 'Options without gluten', 'https://api.iconify.design/fluent:food-grains-24-regular.svg?color=%23b91c1c', '2025-02-05 11:22:09.057762+00'),
('fabbb3c3-b9fd-4861-afa4-e13ba0edb393', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Sesame Free', 'Contains no sesame', 'https://api.iconify.design/game-icons:sesame.svg?color=%23854d0e', '2025-02-05 11:22:09.057762+00'),
('ff256b8a-1965-479b-86da-c67c3a4626da', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Vegetarian', 'Options without meat', 'https://api.iconify.design/material-symbols:eco.svg?color=%2322c55e', '2025-02-05 11:22:09.057762+00');

-- Seed customization groups
INSERT INTO customization_groups (id, restaurant_id, type_id, name, description, is_required, min_selections, max_selections, created_at) VALUES
('2dd0c887-aa9f-4edd-9619-eaeecc0d0273', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', NULL, 'İçecek Boyutu', 'İçeceğinizin boyutunu seçin', 'true', 1, 1, '2025-02-05 12:21:56.011163+00'),
('c2bfcdb3-2602-4a03-ae48-3aad6eae7013', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', NULL, 'Pişirme Derecesi', 'Et pişirme tercihinizi seçin', 'true', 1, 1, '2025-02-05 12:21:55.720353+00'),
('f20d609b-1c9a-4e1d-91c7-983115d0b16e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', NULL, 'Ekstra Malzemeler', 'İstediğiniz ekstra malzemeleri seçin', 'false', 0, 5, '2025-02-05 12:21:56.274444+00');

-- Seed customization options
INSERT INTO customization_options (id, group_id, name, price_adjustment, is_default, created_at) VALUES
('133717c4-519e-43a9-b100-1be3e2054c53', 'f20d609b-1c9a-4e1d-91c7-983115d0b16e', 'Mantar', 8.00, 'false', '2025-02-05 12:21:56.404074+00'),
('1bb0638f-eb7f-4b10-8329-31d399a10b88', '2dd0c887-aa9f-4edd-9619-eaeecc0d0273', 'Orta', 5.00, 'true', '2025-02-05 12:21:56.139656+00'),
('2adafaa0-5be6-4151-ab09-91c628789216', 'c2bfcdb3-2602-4a03-ae48-3aad6eae7013', 'Orta', 0.00, 'true', '2025-02-05 12:21:55.85423+00'),
('3593e5d3-8964-446f-aab0-55ba8c3798f2', 'c2bfcdb3-2602-4a03-ae48-3aad6eae7013', 'Az Pişmiş', 0.00, 'false', '2025-02-05 12:21:55.85423+00'),
('6ba24d8b-c356-4eee-ab63-f603e3e870fb', '2dd0c887-aa9f-4edd-9619-eaeecc0d0273', 'Büyük', 10.00, 'false', '2025-02-05 12:21:56.139656+00'),
('8a6645da-d208-4e4e-9449-5e2dc4184583', 'f20d609b-1c9a-4e1d-91c7-983115d0b16e', 'Ekstra Peynir', 10.00, 'false', '2025-02-05 12:21:56.404074+00'),
('a932b846-0d10-431c-a54c-730f2d0b6d8c', 'f20d609b-1c9a-4e1d-91c7-983115d0b16e', 'Bacon', 15.00, 'false', '2025-02-05 12:21:56.404074+00'),
('b82af74f-ea01-4fda-aa7d-061bc981e322', '2dd0c887-aa9f-4edd-9619-eaeecc0d0273', 'Küçük', 0.00, 'false', '2025-02-05 12:21:56.139656+00'),
('fccdc0f1-4bf9-4b57-beb3-5b31f72671f4', 'c2bfcdb3-2602-4a03-ae48-3aad6eae7013', 'İyi Pişmiş', 0.00, 'false', '2025-02-05 12:21:55.85423+00');

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

-- Drop existing policies
DROP POLICY IF EXISTS "restaurant_access_policy" ON restaurants;
DROP POLICY IF EXISTS "profile_access_policy" ON profiles;
DROP POLICY IF EXISTS "restaurant_staff_access_policy" ON restaurant_staff;
DROP POLICY IF EXISTS "tables_access_policy" ON tables;
DROP POLICY IF EXISTS "menu_categories_access_policy" ON menu_categories;
DROP POLICY IF EXISTS "menu_items_access_policy" ON menu_items;
DROP POLICY IF EXISTS "orders_access_policy" ON orders;
DROP POLICY IF EXISTS "order_items_access_policy" ON order_items;
DROP POLICY IF EXISTS "customization_groups_access_policy" ON customization_groups;
DROP POLICY IF EXISTS "customization_options_access_policy" ON customization_options;
DROP POLICY IF EXISTS "dietary_flags_access_policy" ON dietary_flags;

-- Drop public access policies
DROP POLICY IF EXISTS "public_restaurant_access" ON restaurants;
DROP POLICY IF EXISTS "public_profile_access" ON profiles;
DROP POLICY IF EXISTS "public_restaurant_staff_access" ON restaurant_staff;
DROP POLICY IF EXISTS "public_tables_access" ON tables;
DROP POLICY IF EXISTS "public_menu_categories_access" ON menu_categories;
DROP POLICY IF EXISTS "public_menu_items_access" ON menu_items;
DROP POLICY IF EXISTS "public_orders_access" ON orders;
DROP POLICY IF EXISTS "public_order_items_access" ON order_items;
DROP POLICY IF EXISTS "public_customization_groups_access" ON customization_groups;
DROP POLICY IF EXISTS "public_customization_options_access" ON customization_options;
DROP POLICY IF EXISTS "public_dietary_flags_access" ON dietary_flags;

-- Create authenticated user policies
CREATE POLICY "restaurant_access_policy"
ON restaurants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (
    id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
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
USING (true)
WITH CHECK (
    profile_id = auth.uid()
    OR
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
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

CREATE POLICY "dietary_flags_access_policy"
ON dietary_flags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

-- Create public access policies
CREATE POLICY "public_restaurant_access"
ON restaurants
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_restaurant_staff_access"
ON restaurant_staff
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

CREATE POLICY "public_customization_groups_access"
ON customization_groups
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_customization_options_access"
ON customization_options
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_dietary_flags_access"
ON dietary_flags
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated; 