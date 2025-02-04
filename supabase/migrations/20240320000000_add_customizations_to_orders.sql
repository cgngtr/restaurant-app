-- Add customizations column to order_items table
ALTER TABLE order_items
ADD COLUMN customizations jsonb DEFAULT '{
  "selectedExtras": [],
  "selectedSide": null,
  "selectedSize": null,
  "selectedMilk": null
}'::jsonb;

-- Add a function to calculate the total price including customizations
CREATE OR REPLACE FUNCTION calculate_order_item_total(
  base_price numeric,
  quantity integer,
  customizations jsonb,
  menu_item_customizations jsonb
) RETURNS numeric AS $$
DECLARE
  total numeric := base_price;
  extra text;
  side text;
  size text;
  milk text;
BEGIN
  -- Add extras
  FOR extra IN SELECT jsonb_array_elements_text(customizations->'selectedExtras')
  LOOP
    total := total + COALESCE((menu_item_customizations->'extras'->extra)::numeric, 0);
  END LOOP;

  -- Add side
  side := (customizations->>'selectedSide')::text;
  IF side IS NOT NULL THEN
    total := total + COALESCE((menu_item_customizations->'sides'->side)::numeric, 0);
  END IF;

  -- Add size
  size := (customizations->>'selectedSize')::text;
  IF size IS NOT NULL THEN
    total := total + COALESCE((menu_item_customizations->'sizes'->size)::numeric, 0);
  END IF;

  -- Add milk
  milk := (customizations->>'selectedMilk')::text;
  IF milk IS NOT NULL THEN
    total := total + COALESCE((menu_item_customizations->'milk_options'->milk)::numeric, 0);
  END IF;

  RETURN total * quantity;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update order total when items are added or modified
CREATE OR REPLACE FUNCTION update_order_total() RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT SUM(
      calculate_order_item_total(
        menu_items.price,
        order_items.quantity,
        order_items.customizations,
        menu_items.customization_options
      )
    )
    FROM order_items
    JOIN menu_items ON order_items.menu_item_id = menu_items.id
    WHERE order_items.order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_order_total_trigger ON order_items;

-- Create new trigger
CREATE TRIGGER update_order_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total(); 