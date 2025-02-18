-- Add order_number column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' 
                  AND column_name = 'order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number text;
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
    END IF;
END $$;

-- Function to update table status based on active orders
DROP FUNCTION IF EXISTS update_table_status() CASCADE;
CREATE OR REPLACE FUNCTION update_table_status()
RETURNS trigger AS $$
BEGIN
  -- If a new order is created or status changes
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    -- If order status is pending or preparing, mark table as occupied
    IF NEW.status IN ('pending', 'preparing') THEN
      UPDATE tables
      SET status = 'occupied'
      WHERE id = NEW.table_id;
    -- If order status is completed or cancelled, check if there are other active orders
    ELSIF NEW.status IN ('completed', 'cancelled') THEN
      IF NOT EXISTS (
        SELECT 1 FROM orders
        WHERE table_id = NEW.table_id
        AND status IN ('pending', 'preparing')
        AND id != NEW.id
      ) THEN
        UPDATE tables
        SET status = 'available'
        WHERE id = NEW.table_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS orders_table_status_trigger ON orders;

-- Trigger for table status updates
CREATE TRIGGER orders_table_status_trigger
  AFTER INSERT OR UPDATE OF status
  ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_table_status();

-- Function to calculate order total
DROP FUNCTION IF EXISTS calculate_order_total(uuid) CASCADE;
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id uuid)
RETURNS decimal AS $$
DECLARE
  total decimal(10,2);
BEGIN
  SELECT SUM(oi.quantity * oi.unit_price)
  INTO total
  FROM order_items oi
  WHERE oi.order_id = p_order_id;
  
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update order total
DROP FUNCTION IF EXISTS update_order_total() CASCADE;
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS trigger AS $$
BEGIN
  -- Use explicit table reference to avoid ambiguity
  UPDATE orders o
  SET total_amount = calculate_order_total(o.id)
  WHERE o.id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS order_items_total_trigger ON order_items;

-- Trigger to update order total when items change
CREATE TRIGGER order_items_total_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- Function to check menu item availability
DROP FUNCTION IF EXISTS check_menu_item_availability() CASCADE;
CREATE OR REPLACE FUNCTION check_menu_item_availability()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM menu_items mi
    WHERE mi.id = NEW.menu_item_id
    AND mi.is_available = true
  ) THEN
    RAISE EXCEPTION 'Menu item is not available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS order_items_availability_trigger ON order_items;

-- Trigger to check availability before adding items to order
CREATE TRIGGER order_items_availability_trigger
  BEFORE INSERT
  ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION check_menu_item_availability();

-- Function to generate next manual order number
DROP FUNCTION IF EXISTS next_manual_order_number(text) CASCADE;
CREATE OR REPLACE FUNCTION public.next_manual_order_number(table_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_timestamp_str text;
    random_str text;
    result text;
BEGIN
    -- Get current timestamp in YYYYMMDDHH24MISS format
    current_timestamp_str := to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');
    
    -- Generate a random 3-digit number
    random_str := LPAD(floor(random() * 1000)::text, 3, '0');
    
    -- Format result as: TABLE_NUMBER + TIMESTAMP + RANDOM
    result := table_number || '-' || current_timestamp_str || '-' || random_str;
    
    RETURN result;
END;
$$; 