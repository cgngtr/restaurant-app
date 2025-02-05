-- Önce mevcut tabloyu temizle
DROP TABLE IF EXISTS menu_item_dietary_flags;

-- Menu item - dietary flag ilişki tablosu
CREATE TABLE menu_item_dietary_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    flag_id UUID REFERENCES dietary_flags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, flag_id)
);

-- RLS Policies
ALTER TABLE menu_item_dietary_flags ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri temizle
DROP POLICY IF EXISTS "Public can view menu_item_dietary_flags" ON menu_item_dietary_flags;
DROP POLICY IF EXISTS "Public can insert menu_item_dietary_flags" ON menu_item_dietary_flags;
DROP POLICY IF EXISTS "Public can update menu_item_dietary_flags" ON menu_item_dietary_flags;
DROP POLICY IF EXISTS "Public can delete menu_item_dietary_flags" ON menu_item_dietary_flags;

-- Yeni policy'leri ekle
CREATE POLICY "Public can do anything with menu_item_dietary_flags"
    ON menu_item_dietary_flags FOR ALL
    USING (true)
    WITH CHECK (true);