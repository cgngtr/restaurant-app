-- First, ensure the restaurant_staff table exists
CREATE TABLE IF NOT EXISTS restaurant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, profile_id)
);

-- Step 1: Reset RLS and policies for all tables
DROP POLICY IF EXISTS "restaurant_staff_select_policy" ON restaurant_staff;
DROP POLICY IF EXISTS "restaurant_select_policy" ON restaurants;
DROP POLICY IF EXISTS "profile_select_policy" ON profiles;
DROP POLICY IF EXISTS "table_select_policy" ON tables;

-- Step 2: Update or insert profile record
DO $$ 
BEGIN
    -- Try to update existing profile
    UPDATE profiles 
    SET role = 'restaurant_owner',
        updated_at = NOW()
    WHERE id = '3bb6d889-7065-4a4e-8ca9-116113c9c43e'
    OR email = 'cgngtr1014@hotmail.com';

    -- If no profile exists, create a new one
    IF NOT FOUND THEN
        INSERT INTO profiles (id, email, role, created_at, updated_at)
        VALUES (
            '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
            'cgngtr1014@hotmail.com',
            'restaurant_owner',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Step 3: Ensure the restaurant_staff record exists
INSERT INTO restaurant_staff (restaurant_id, profile_id, role)
VALUES (
    '2f3c2e2e-6166-4f32-a0d9-6083548cac83',
    '3bb6d889-7065-4a4e-8ca9-116113c9c43e',
    'owner'
) ON CONFLICT (restaurant_id, profile_id) 
DO UPDATE SET role = 'owner';

-- Step 4: Enable RLS on all tables
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_flags ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for each table
-- restaurant_staff policy
CREATE POLICY "restaurant_staff_select_policy"
ON restaurant_staff
FOR ALL
TO authenticated
USING (
    profile_id = auth.uid()
);

-- restaurants policy
CREATE POLICY "restaurant_select_policy"
ON restaurants
FOR ALL
TO authenticated
USING (
    id IN (
        SELECT restaurant_id 
        FROM restaurant_staff 
        WHERE profile_id = auth.uid()
    )
);

-- profiles policy
CREATE POLICY "profile_select_policy"
ON profiles
FOR ALL
TO authenticated
USING (
    id = auth.uid()
);

-- tables policy
CREATE POLICY "table_select_policy"
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

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Verify setup
DO $$ 
BEGIN
    RAISE NOTICE 'Verifying setup...';
    
    -- Check if profile exists
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = 'cgngtr1014@hotmail.com'
    ) THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;
    
    -- Check if restaurant_staff record exists
    IF NOT EXISTS (
        SELECT 1 FROM restaurant_staff 
        WHERE profile_id = '3bb6d889-7065-4a4e-8ca9-116113c9c43e'
        AND restaurant_id = '2f3c2e2e-6166-4f32-a0d9-6083548cac83'
    ) THEN
        RAISE EXCEPTION 'Restaurant staff record not found';
    END IF;
    
    -- Check if restaurant exists
    IF NOT EXISTS (
        SELECT 1 FROM restaurants 
        WHERE id = '2f3c2e2e-6166-4f32-a0d9-6083548cac83'
    ) THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;
    
    RAISE NOTICE 'Setup verified successfully';
END $$; 