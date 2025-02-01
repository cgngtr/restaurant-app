-- Update tables table to add qr_code column
ALTER TABLE tables
ADD COLUMN IF NOT EXISTS qr_code TEXT; 