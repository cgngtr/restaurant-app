-- First, drop all existing restaurant policies
DROP POLICY IF EXISTS "restaurant_select_policy" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Public can view basic restaurant info" ON restaurants;

-- Create a single, clear policy for restaurant access
CREATE POLICY "restaurant_access_policy"
ON restaurants
FOR ALL
TO authenticated
USING (
    -- Allow access if user is restaurant staff
    id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
    OR
    -- Allow access if user is the restaurant owner (via contact email)
    contact_email = auth.email()
);

-- Create a policy for public access (read-only)
CREATE POLICY "restaurant_public_access_policy"
ON restaurants
FOR SELECT
TO anon
USING (true); 