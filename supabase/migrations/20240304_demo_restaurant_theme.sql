-- Demo Restaurant Theme Settings

-- Tema tablosu oluşturma
CREATE TABLE IF NOT EXISTS restaurant_themes (
    id uuid default uuid_generate_v4() primary key,
    restaurant_id uuid references restaurants(id) on delete cascade,
    primary_color text default '#E53935',
    secondary_color text default '#FFB74D',
    text_color text default '#333333',
    background_color text default '#FFFFFF',
    font_family text default 'Inter',
    logo_position text default 'center',
    menu_layout text default 'grid',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(restaurant_id)
);

-- RLS politikaları
ALTER TABLE restaurant_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage themes"
    ON restaurant_themes FOR ALL
    USING (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = restaurant_themes.restaurant_id
        AND restaurants.contact_email = auth.email()
    ));

CREATE POLICY "Public can view themes"
    ON restaurant_themes FOR SELECT
    USING (true);

-- Demo restaurant için tema ayarları
WITH rest AS (SELECT id FROM restaurants WHERE slug = 'lezzet-kosesi')
INSERT INTO restaurant_themes (
    restaurant_id,
    primary_color,
    secondary_color,
    text_color,
    background_color,
    font_family,
    logo_position,
    menu_layout
)
SELECT 
    id,
    '#8D191D',  -- Koyu kırmızı
    '#F3B95F',  -- Altın sarısı
    '#2D2D2D',  -- Koyu gri
    '#FFF9F0',  -- Krem
    'Raleway',
    'center',
    'grid'
FROM rest; 