-- Anonim kullanıcılar için okuma politikaları
CREATE POLICY "Public can view active restaurants"
    ON restaurants FOR SELECT
    USING (active = true);

CREATE POLICY "Public can view restaurant tables"
    ON tables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.active = true
        )
    );

CREATE POLICY "Public can view menu categories"
    ON menu_categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = menu_categories.restaurant_id
            AND restaurants.active = true
        )
    );

CREATE POLICY "Public can view menu items"
    ON menu_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = menu_items.restaurant_id
            AND restaurants.active = true
        )
    );

CREATE POLICY "Public can view restaurant themes"
    ON restaurant_themes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = restaurant_themes.restaurant_id
            AND restaurants.active = true
        )
    );

-- Anonim kullanıcılar için sipariş politikaları
CREATE POLICY "Public can create orders"
    ON orders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE restaurants.id = orders.restaurant_id
            AND restaurants.active = true
        )
    );

CREATE POLICY "Public can view their orders"
    ON orders FOR SELECT
    USING (
        created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    );

CREATE POLICY "Public can create order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        )
    );

CREATE POLICY "Public can view their order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        )
    ); 