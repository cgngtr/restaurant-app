-- Seed initial restaurant
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

-- Seed user profiles
INSERT INTO profiles (id, email, role, created_at, updated_at) 
VALUES
    ('3bb6d889-7065-4a4e-8ca9-116113c9c43e', 'cgngtr1014@hotmail.com', 'restaurant_owner', '2025-02-09 01:09:27.433435+00', '2025-02-09 01:09:27.433435+00'),
    ('ca1b13f5-b086-421b-8c32-823f71a2c7ad', 'cgngtr5026@hotmail.com', 'superadmin', '2025-02-09 00:14:47.215202+00', '2025-02-09 00:14:47.215202+00');

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
    