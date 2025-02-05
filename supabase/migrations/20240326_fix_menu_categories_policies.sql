-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can insert menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Public can delete menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Public can select restaurant staff" ON restaurant_staff;

-- Create new policies for menu_categories
CREATE POLICY "Public can insert menu categories"
    ON menu_categories FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Public can delete menu categories"
    ON menu_categories FOR DELETE
    TO public
    USING (true);

-- Create new policy for restaurant_staff
CREATE POLICY "Public can select restaurant staff"
    ON restaurant_staff FOR SELECT
    TO public
    USING (true); 