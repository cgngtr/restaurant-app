-- Restaurants tablosundaki verileri kontrol et
SELECT * FROM restaurants;

-- Restaurants tablosunun yapısını kontrol et
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'restaurants'; 