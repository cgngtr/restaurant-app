-- Fix permissions for authenticated users
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE USAGE ON SCHEMA public FROM authenticated;

-- Grant proper permissions in correct order
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant specific table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE restaurants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE restaurant_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE tables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE menu_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE menu_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE restaurant_themes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE customization_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE customization_options TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE dietary_flags TO authenticated;

-- Grant permissions to public tables to anon role
GRANT SELECT ON TABLE restaurants TO anon;
GRANT SELECT ON TABLE menu_categories TO anon;
GRANT SELECT ON TABLE menu_items TO anon;
GRANT SELECT ON TABLE tables TO anon; 