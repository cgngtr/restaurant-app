-- Özelleştirme grup tipleri (örn: "size", "milk_options", "cooking_degree" vs)
CREATE TABLE customization_group_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Özelleştirme grupları
CREATE TABLE customization_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id),
    type_id UUID REFERENCES customization_group_types(id),
    name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    min_selections INT DEFAULT 0,
    max_selections INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Özelleştirme seçenekleri
CREATE TABLE customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES customization_groups(id),
    name TEXT NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menü öğesi - özelleştirme grup ilişkisi
CREATE TABLE menu_item_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id),
    group_id UUID REFERENCES customization_groups(id),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, group_id)
);

-- RLS Policies
ALTER TABLE customization_group_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_customizations ENABLE ROW LEVEL SECURITY;

-- Public Policies (Geçici olarak)
CREATE POLICY "Public can view customization_group_types"
    ON customization_group_types FOR SELECT
    USING (true);

CREATE POLICY "Public can insert customization_group_types"
    ON customization_group_types FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update customization_group_types"
    ON customization_group_types FOR UPDATE
    USING (true);

CREATE POLICY "Public can delete customization_group_types"
    ON customization_group_types FOR DELETE
    USING (true);

CREATE POLICY "Public can view customization_groups"
    ON customization_groups FOR SELECT
    USING (true);

CREATE POLICY "Public can insert customization_groups"
    ON customization_groups FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update customization_groups"
    ON customization_groups FOR UPDATE
    USING (true);

CREATE POLICY "Public can delete customization_groups"
    ON customization_groups FOR DELETE
    USING (true);

CREATE POLICY "Public can view customization_options"
    ON customization_options FOR SELECT
    USING (true);

CREATE POLICY "Public can insert customization_options"
    ON customization_options FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update customization_options"
    ON customization_options FOR UPDATE
    USING (true);

CREATE POLICY "Public can delete customization_options"
    ON customization_options FOR DELETE
    USING (true);

CREATE POLICY "Public can view menu_item_customizations"
    ON menu_item_customizations FOR SELECT
    USING (true);

CREATE POLICY "Public can insert menu_item_customizations"
    ON menu_item_customizations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update menu_item_customizations"
    ON menu_item_customizations FOR UPDATE
    USING (true);

CREATE POLICY "Public can delete menu_item_customizations"
    ON menu_item_customizations FOR DELETE
    USING (true); 