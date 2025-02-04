-- Önce mevcut politikaları temizle
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view restaurant tables" ON tables;
DROP POLICY IF EXISTS "Public can view menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can view restaurant themes" ON restaurant_themes;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can view their orders" ON orders;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can view their order items" ON order_items;

-- Geçici olarak tüm tablolara tam erişim ver (test için)
CREATE POLICY "Enable read access for all users"
    ON restaurants FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON tables FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON menu_categories FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON menu_items FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON restaurant_themes FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON orders FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON order_items FOR SELECT
    TO PUBLIC
    USING (true);

-- Anonim kullanıcılar için INSERT izinleri
CREATE POLICY "Enable insert access for all users"
    ON orders FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Enable insert access for all users"
    ON order_items FOR INSERT
    TO PUBLIC
    WITH CHECK (true); 