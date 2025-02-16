-- First, drop existing policies
DROP POLICY IF EXISTS "Restaurant staff can manage orders" ON orders;
DROP POLICY IF EXISTS "Public can create and view own orders" ON orders;
DROP POLICY IF EXISTS "Restaurant staff can view order items" ON order_items;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;

-- Create policies for orders table
CREATE POLICY "order_access_policy"
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

-- Create policies for order_items table
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

-- Create policies for tables table
DROP POLICY IF EXISTS "Restaurant staff can manage tables" ON tables;
DROP POLICY IF EXISTS "Public can view table status" ON tables;

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

-- Create public read-only policies
CREATE POLICY "tables_public_access_policy"
ON tables
FOR SELECT
TO anon
USING (true);

CREATE POLICY "orders_public_access_policy"
ON orders
FOR SELECT
TO anon
USING (true);

CREATE POLICY "order_items_public_access_policy"
ON order_items
FOR SELECT
TO anon
USING (true); 