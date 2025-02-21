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

INSERT INTO profiles (id, email, display_name, role, created_at, updated_at) 
VALUES (
    '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
    'cgngtr1014@hotmail.com',
    'Çağan Uğtur',
    'restaurant_owner',
    '2025-02-09 01:09:27.433435+00',
    '2025-02-09 01:09:27.433435+00'
);

INSERT INTO restaurant_staff (id, restaurant_id, profile_id, role, created_at)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '2f3c2e2e-6166-4f32-a0d9-6083548cac83',
    '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
    'owner',
    '2025-02-09 01:09:27.433435+00'
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

-- Seed orders
INSERT INTO orders (id, restaurant_id, table_id, status, total_amount, notes, created_at, updated_at, order_number, payment_status) VALUES
('0203bd48-c626-4f1f-a50e-46e2b4230aa1', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'cancelled', 0.00, NULL, '2025-02-05 23:55:51.875619+00', '2025-02-05 23:55:51.875619+00', 'QR-B1-0023', 'pending'),
('11e85d78-a843-45f0-aba8-5ac037900981', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b1b472f8-82b9-40c0-97b0-0c19b07947d8', 'cancelled', 65.00, NULL, '2025-02-06 00:04:36.005069+00', '2025-02-06 00:04:36.005069+00', 'QR-B4-0029', 'pending'),
('126e5ae9-f85c-4ce4-8dea-05c27adc4482', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b6827a9e-82be-4714-88d0-35d542c9a02e', 'completed', 54.00, NULL, '2025-02-05 23:35:58.47939+00', '2025-02-05 23:35:58.47939+00', 'QR-T4-0013', 'completed'),
('17de353d-1f54-40dc-b5c8-223f0d7dcef7', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '6c6d2105-b0af-48eb-a349-aee847328e0e', 'cancelled', 45.00, NULL, '2025-02-06 00:02:50.433816+00', '2025-02-06 00:02:50.433816+00', 'QR-T5-0028', 'pending'),
('1d2b3c4c-b420-4589-95b8-b9ab4e428d06', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'completed', 47.00, NULL, '2025-02-05 22:35:43.585101+00', '2025-02-05 22:35:43.585101+00', 'ORD-2025007', 'completed'),
('2082039e-a286-4ee4-84ce-1059fd6cfc3e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'cancelled', 0.00, NULL, '2025-02-05 23:57:12.91788+00', '2025-02-05 23:57:12.91788+00', 'QR-B1-0024', 'pending'),
('28635ad6-e207-402c-a15e-b78784ec872a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '6c6d2105-b0af-48eb-a349-aee847328e0e', 'cancelled', 78.00, NULL, '2025-02-06 00:06:59.132478+00', '2025-02-06 00:06:59.132478+00', 'MN-BB5-0006', 'pending'),
('31a342e9-d6ac-4168-b632-5d57ac770f1d', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'completed', 52.00, NULL, '2025-02-05 22:30:53.549704+00', '2025-02-05 22:30:53.549704+00', 'ORD-2025005', 'completed'),
('343abf3e-4b6d-4b77-85fa-fb9d80bb9610', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'completed', 67.00, NULL, '2025-02-07 21:32:26.656988+00', '2025-02-07 21:32:26.656988+00', 'QR-BT1-0032', 'completed'),
('446cc030-78a5-4620-869e-df6f91a18ba8', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'cancelled', 85.00, NULL, '2025-02-06 00:05:51.419738+00', '2025-02-06 00:05:51.419738+00', 'QR-B2-0030', 'pending'),
('526fdca0-220e-4bce-abbc-3d113c69bb83', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'completed', 44.00, NULL, '2025-02-05 23:38:42.969271+00', '2025-02-05 23:38:42.969271+00', 'QR-B2-0014', 'completed'),
('5fea0f76-1b65-4611-a694-ab0d013fc182', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'completed', 502.00, NULL, '2025-02-05 23:50:23.005894+00', '2025-02-05 23:50:23.005894+00', 'QR-T3-0021', 'completed'),
('65ac46cb-85ad-417c-a0aa-37fb30b91806', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b1b472f8-82b9-40c0-97b0-0c19b07947d8', 'completed', 54.00, NULL, '2025-02-05 22:33:21.34889+00', '2025-02-05 22:33:21.34889+00', 'ORD-2025006', 'completed'),
('67ccad15-ca65-4264-8930-4cfe6a77bd35', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '6c6d2105-b0af-48eb-a349-aee847328e0e', 'completed', 47.00, NULL, '2025-02-05 23:43:37.330967+00', '2025-02-05 23:43:37.330967+00', 'QR-B5-0018', 'completed'),
('743eee9e-e28c-4711-8d16-edc302189362', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b6827a9e-82be-4714-88d0-35d542c9a02e', 'completed', 100.00, NULL, '2025-02-05 23:41:16.703554+00', '2025-02-05 23:41:16.703554+00', 'QR-T4-0016', 'completed'),
('767fa3ca-d585-4521-9c1d-272e4917c9ba', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'completed', 67.00, NULL, '2025-02-07 21:31:01.531803+00', '2025-02-07 21:31:01.531803+00', 'QR-BT1-0031', 'pending'),
('900d83f7-b271-4242-b843-217660afc7ab', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b1b472f8-82b9-40c0-97b0-0c19b07947d8', 'completed', 242.00, NULL, '2025-02-05 23:48:52.459487+00', '2025-02-05 23:48:52.459487+00', 'QR-T2-0020', 'completed'),
('96c86f89-c8d6-4125-af28-b3a0921d5c2f', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b1b472f8-82b9-40c0-97b0-0c19b07947d8', 'completed', 67.00, NULL, '2025-02-05 23:41:48.262165+00', '2025-02-05 23:41:48.262165+00', 'QR-B4-0017', 'completed'),
('b678cab6-bb9d-4b76-908a-db99114cb9f5', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '6c6d2105-b0af-48eb-a349-aee847328e0e', 'completed', 182.00, NULL, '2025-02-05 23:47:17.104276+00', '2025-02-05 23:47:17.104276+00', 'QR-T5-0019', 'completed'),
('b88d93f0-482c-4b9c-904c-854e8d2c49de', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'completed', 42.00, NULL, '2025-02-05 23:52:24.650935+00', '2025-02-05 23:52:24.650935+00', 'QR-T3-0022', 'completed'),
('bad7aaad-f4a0-4291-ae95-f2257ab75497', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'cancelled', 78.00, NULL, '2025-02-06 00:01:02.731476+00', '2025-02-06 00:01:02.731476+00', 'QR-B2-0026', 'pending'),
('c7608167-4c88-4d17-bae1-acc8ee9d8306', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'cancelled', 130.00, NULL, '2025-02-05 23:58:05.308935+00', '2025-02-05 23:58:05.308935+00', 'QR-B1-0025', 'pending'),
('d10fa25a-7406-4b8f-962c-ab4479137d7d', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b6827a9e-82be-4714-88d0-35d542c9a02e', 'completed', 52.00, NULL, '2025-02-05 23:29:02.287394+00', '2025-02-05 23:29:02.287394+00', 'QR-T4-0011', 'completed'),
('d2b4e4df-1ff6-4c5f-b1ff-4015ad9ce765', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '11c731c0-9e5a-4e9e-8442-eb995ccf7d96', 'completed', 95.00, NULL, '2025-02-06 00:01:48.222173+00', '2025-02-06 00:01:48.222173+00', 'QR-B2-0027', 'completed'),
('f6b8d49b-3445-42c8-b6d2-2a439441d794', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b6827a9e-82be-4714-88d0-35d542c9a02e', 'completed', 52.00, NULL, '2025-02-05 23:35:00.828764+00', '2025-02-05 23:35:00.828764+00', 'QR-T4-0012', 'completed'),
('f7a647eb-401a-4b07-a425-17e5071be7e2', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'ed67d80b-b446-4d02-98fc-ace71a294bbd', 'completed', 0.00, NULL, '2025-02-05 22:40:27.526261+00', '2025-02-05 22:40:27.526261+00', 'ORD-2025008', 'completed'),
('fff6bbef-f26e-4b85-918c-e6b84c3f4d4d', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'b1b472f8-82b9-40c0-97b0-0c19b07947d8', 'completed', 64.00, NULL, '2025-02-05 23:40:31.599096+00', '2025-02-05 23:40:31.599096+00', 'QR-B3-0015', 'completed');

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_dietary_flags ENABLE ROW LEVEL SECURITY;
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
DROP POLICY IF EXISTS "menu_item_customizations_access_policy" ON menu_item_customizations;
DROP POLICY IF EXISTS "menu_item_dietary_flags_access_policy" ON menu_item_dietary_flags;
DROP POLICY IF EXISTS "public_menu_item_customizations_access" ON menu_item_customizations;
DROP POLICY IF EXISTS "public_menu_item_dietary_flags_access" ON menu_item_dietary_flags;

-- Drop public access policies
DROP POLICY IF EXISTS "public_restaurant_access" ON restaurants;
DROP POLICY IF EXISTS "public_restaurant_staff_access" ON restaurant_staff;
DROP POLICY IF EXISTS "public_tables_access" ON tables;
DROP POLICY IF EXISTS "public_menu_categories_access" ON menu_categories;
DROP POLICY IF EXISTS "public_menu_items_access" ON menu_items;
DROP POLICY IF EXISTS "public_orders_access" ON orders;
DROP POLICY IF EXISTS "public_order_items_access" ON order_items;
DROP POLICY IF EXISTS "public_customization_groups_access" ON customization_groups;
DROP POLICY IF EXISTS "public_customization_options_access" ON customization_options;
DROP POLICY IF EXISTS "public_dietary_flags_access" ON dietary_flags;
DROP POLICY IF EXISTS "public_menu_item_customizations_access" ON menu_item_customizations;
DROP POLICY IF EXISTS "public_menu_item_dietary_flags_access" ON menu_item_dietary_flags;

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

-- Create menu_item_customizations policies
CREATE POLICY "menu_item_customizations_access_policy"
ON menu_item_customizations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM menu_items mi
        JOIN restaurant_staff rs ON rs.restaurant_id = mi.restaurant_id
        WHERE mi.id = menu_item_customizations.menu_item_id
        AND rs.profile_id = auth.uid()
    )
);

-- Create menu_item_dietary_flags policies
CREATE POLICY "menu_item_dietary_flags_access_policy"
ON menu_item_dietary_flags
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM menu_items mi
        JOIN restaurant_staff rs ON rs.restaurant_id = mi.restaurant_id
        WHERE mi.id = menu_item_dietary_flags.menu_item_id
        AND rs.profile_id = auth.uid()
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

CREATE POLICY "public_menu_item_customizations_access"
ON menu_item_customizations
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_menu_item_dietary_flags_access"
ON menu_item_dietary_flags
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

CREATE POLICY "suppliers_access_policy"
ON suppliers
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "stock_items_access_policy"
ON stock_items
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "stock_transactions_access_policy"
ON stock_transactions
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "stock_alerts_access_policy"
ON stock_alerts
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

-- Stock Management Sample Data
INSERT INTO suppliers (id, restaurant_id, company_name, contact_person, email, phone, address, status)
VALUES 
    ('f6088c5a-9e0a-7e1d-2e7f-1a7f4e9a2a3d', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Fresh Produce Co.', 'John Smith', 'john@freshproduce.com', '+90 532 555 1234', '123 Market St, Istanbul', 'active'),
    ('871a9d6a-0f1a-8f2e-3f8a-2a8a5f0a3a4e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Global Packaging Ltd.', 'Emma Wilson', 'emma@globalpack.com', '+90 533 555 5678', '456 Industry Ave, Ankara', 'active');

INSERT INTO stock_items (id, restaurant_id, supplier_id, name, sku, description, unit, quantity, minimum_quantity, maximum_quantity, unit_cost, last_ordered_at, last_received_at)
VALUES 
    ('a8230e7a-1a2b-9a3f-4a9b-3a9b6a1a4a5f', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'f6088c5a-9e0a-7e1d-2e7f-1a7f4e9a2a3d', 'Tomatoes', 'TOM001', 'Fresh red tomatoes', 'kg', 50, 20, 100, 2.50, NULL, NULL),
    ('1931f8aa-2a3b-0a4a-5a0a-4a0a7a2a5a6a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', '871a9d6a-0f1a-8f2e-3f8a-2a8a5f0a3a4e', 'Packaging Boxes', 'BOX001', 'Standard size packaging boxes', 'unit', 1000, 500, 2000, 0.75, NULL, NULL);

INSERT INTO stock_transactions (id, restaurant_id, stock_item_id, supplier_id, transaction_type, quantity, unit_cost, notes, created_by)
VALUES 
    ('104a2a9a-314a-115a-611a-5a1a8a3a6a7a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'a8230e7a-1a2b-9a3f-4a9b-3a9b6a1a4a5f', 'f6088c5a-9e0a-7e1d-2e7f-1a7f4e9a2a3d', 'received', 50, 2.50, 'Initial stock', '3bb6d889-7065-4a4e-8ca9-116113c9c43e');

INSERT INTO stock_alerts (id, restaurant_id, stock_item_id, alert_type, status, message)
VALUES 
    ('a15a3a0a-4a5a-2a6a-7a2a-6a2a9a4a7a8a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'a8230e7a-1a2b-9a3f-4a9b-3a9b6a1a4a5f', 'low_stock', 'active', 'Tomatoes stock is running low');

-- Enable RLS for navigation_settings
ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;

-- Create navigation_settings index
CREATE INDEX idx_navigation_settings_restaurant ON navigation_settings(restaurant_id);

-- Create policy for authenticated users
DROP POLICY IF EXISTS "navigation_settings_access_policy" ON navigation_settings;

CREATE POLICY "navigation_settings_access_policy"
ON navigation_settings
FOR ALL
TO authenticated
USING (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    restaurant_id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

-- Insert default navigation items for our sample restaurant
INSERT INTO navigation_settings (id, restaurant_id, name, href, icon, sort_order, is_visible) 
VALUES 
    ('d1a2b3c4-e5f6-4a5b-9c8d-1a2b3c4d5e6f', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Dashboard', '/dashboard', 'LayoutDashboard', 1, true),
    ('e2b3c4d5-f6a7-5b6c-0d9e-2b3c4d5e6f7a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Menu', '/menu', 'MenuIcon', 2, true),
    ('f3c4d5e6-a7b8-6c7d-1e2f-3c4d5e6f7a8b', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Tables', '/tables', 'Table2', 3, true),
    ('a4d5e6f7-b8c9-7d8e-2f3a-4d5e6f7a8b9c', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Orders', '/orders', 'ClipboardList', 4, true),
    ('f4e5d6c7-b9a0-9f0e-4b5c-7f8e9d0c1b2a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Staff', '/staff', 'Users', 5, true);

-- Insert Stock management with children
WITH stock_parent AS (
    INSERT INTO navigation_settings (id, restaurant_id, name, href, icon, sort_order, is_visible)
    VALUES ('b5e6f7a8-c9d0-8e9f-3a4b-5e6f7a8b9c0d', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Stock', '/stock', 'Package', 5, true)
    RETURNING id
)
INSERT INTO navigation_settings (restaurant_id, name, href, icon, parent_id, sort_order, is_visible)
SELECT 
    '2f3c2e2e-6166-4f32-a0d9-6083548cac83',
    name,
    href,
    icon,
    stock_parent.id,
    sort_order,
    true
FROM stock_parent, (VALUES 
    ('Current Stock', '/stock/current-stock', 'Package', 1),
    ('Categories', '/stock/categories', 'FolderTree', 2),
    ('Suppliers', '/stock/suppliers', 'Building2', 3)
) AS children(name, href, icon, sort_order);

-- Insert remaining items
INSERT INTO navigation_settings (id, restaurant_id, name, href, icon, sort_order, is_visible) 
VALUES 
    ('c6f7a8b9-d0e1-9f0a-4b5c-6f7a8b9c0d1e', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Finance Calculator', '/finance-calculator', 'Calculator', 6, true),
    ('d7a8b9c0-e1f2-0a1b-5c6d-7a8b9c0d1e2f', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Customization', '/customization', 'Sliders', 7, true),
    ('e8b9c0d1-f2a3-1b2c-6d7e-8b9c0d1e2f3a', '2f3c2e2e-6166-4f32-a0d9-6083548cac83', 'Settings', '/settings', 'Settings', 8, true);

CREATE POLICY "suppliers_restaurant_access" ON suppliers
FOR ALL USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_staff 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "stock_items_restaurant_access" ON stock_items
FOR ALL USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_staff 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "stock_transactions_restaurant_access" ON stock_transactions
FOR ALL USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_staff 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "stock_alerts_restaurant_access" ON stock_alerts
FOR ALL USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_staff 
    WHERE profile_id = auth.uid()
  )
);