-- Insert test restaurant
INSERT INTO restaurants (id, name, slug, logo_url, active, created_at)
VALUES (
  'rest_demo1',
  'Demo Restaurant',
  'demo-restaurant',
  'https://picsum.photos/200',
  true,
  NOW()
);

-- Insert test tables
INSERT INTO tables (id, restaurant_id, table_number, status, created_at)
VALUES 
  ('table_1', 'rest_demo1', '1', 'available', NOW()),
  ('table_2', 'rest_demo1', '2', 'available', NOW()),
  ('table_3', 'rest_demo1', '3', 'occupied', NOW());

-- Insert menu categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order, active, created_at)
VALUES 
  ('cat_starters', 'rest_demo1', 'Starters', 1, true, NOW()),
  ('cat_mains', 'rest_demo1', 'Main Courses', 2, true, NOW()),
  ('cat_desserts', 'rest_demo1', 'Desserts', 3, true, NOW()),
  ('cat_drinks', 'rest_demo1', 'Drinks', 4, true, NOW());

-- Insert menu items
INSERT INTO menu_items (
  id, restaurant_id, category_id, name, description, 
  price, image_url, is_available, dietary_flags, created_at
)
VALUES 
  (
    'item_1',
    'rest_demo1',
    'cat_starters',
    'Crispy Calamari',
    'Fresh calamari rings served with tartar sauce',
    12.99,
    'https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['seafood'],
    NOW()
  ),
  (
    'item_2',
    'rest_demo1',
    'cat_starters',
    'Garden Salad',
    'Mixed greens with cherry tomatoes and balsamic dressing',
    9.99,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['vegetarian', 'vegan', 'gluten-free'],
    NOW()
  ),
  (
    'item_3',
    'rest_demo1',
    'cat_mains',
    'Grilled Chicken',
    'Herb-marinated chicken breast with roasted vegetables',
    24.99,
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['gluten-free'],
    NOW()
  ),
  (
    'item_4',
    'rest_demo1',
    'cat_mains',
    'Vegetable Curry',
    'Mixed vegetables in a rich coconut curry sauce',
    18.99,
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['vegetarian', 'vegan', 'spicy'],
    NOW()
  ),
  (
    'item_5',
    'rest_demo1',
    'cat_desserts',
    'Chocolate Lava Cake',
    'Warm chocolate cake with a molten center',
    8.99,
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['vegetarian'],
    NOW()
  ),
  (
    'item_6',
    'rest_demo1',
    'cat_drinks',
    'Fresh Lemonade',
    'House-made lemonade with mint',
    4.99,
    'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=800&h=600&fit=crop',
    true,
    ARRAY['vegan', 'gluten-free'],
    NOW()
  ); 