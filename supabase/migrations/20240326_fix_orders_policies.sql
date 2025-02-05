-- Drop existing policies
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;
DROP POLICY IF EXISTS "Public can delete orders" ON orders;

DROP POLICY IF EXISTS "Public can view order_items" ON order_items;
DROP POLICY IF EXISTS "Public can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Public can update order_items" ON order_items;
DROP POLICY IF EXISTS "Public can delete order_items" ON order_items;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create new open policies
CREATE POLICY "Public can do anything with orders"
    ON orders FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can do anything with order_items"
    ON order_items FOR ALL
    USING (true)
    WITH CHECK (true); 