-- Restaurant bilgilerini kontrol et
SELECT id, name, slug FROM restaurants WHERE slug = 'demo-restaurant';

-- Restaurant'a ait masaları kontrol et
SELECT t.table_number, t.status 
FROM tables t
JOIN restaurants r ON t.restaurant_id = r.id
WHERE r.slug = 'demo-restaurant';