-- Function to update table status based on active orders
create or replace function update_table_status()
returns trigger as $$
begin
  -- If a new order is created or status changes
  if (TG_OP = 'INSERT') or (TG_OP = 'UPDATE' and OLD.status != NEW.status) then
    -- If order status is pending or preparing, mark table as occupied
    if NEW.status in ('pending', 'preparing') then
      update tables
      set status = 'occupied'
      where id = NEW.table_id;
    -- If order status is completed or cancelled, check if there are other active orders
    elsif NEW.status in ('completed', 'cancelled') then
      if not exists (
        select 1 from orders
        where table_id = NEW.table_id
        and status in ('pending', 'preparing')
        and id != NEW.id
      ) then
        update tables
        set status = 'available'
        where id = NEW.table_id;
      end if;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger for table status updates
create trigger orders_table_status_trigger
  after insert or update of status
  on orders
  for each row
  execute function update_table_status();

-- Function to calculate order total
create or replace function calculate_order_total(order_id uuid)
returns decimal as $$
declare
  total decimal(10,2);
begin
  select sum(quantity * unit_price)
  into total
  from order_items
  where order_id = $1;
  
  return coalesce(total, 0);
end;
$$ language plpgsql security definer;

-- Trigger to update order total when items change
create or replace function update_order_total()
returns trigger as $$
begin
  update orders
  set total_amount = calculate_order_total(NEW.order_id)
  where id = NEW.order_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger order_items_total_trigger
  after insert or update or delete
  on order_items
  for each row
  execute function update_order_total();

-- Function to check menu item availability
create or replace function check_menu_item_availability()
returns trigger as $$
begin
  if not exists (
    select 1 from menu_items
    where id = NEW.menu_item_id
    and is_available = true
  ) then
    raise exception 'Menu item is not available';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to check availability before adding items to order
create trigger order_items_availability_trigger
  before insert
  on order_items
  for each row
  execute function check_menu_item_availability();

-- Function to generate next manual order number
CREATE OR REPLACE FUNCTION public.next_manual_order_number(table_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_date text;
    last_number integer;
    next_number integer;
    result text;
BEGIN
    -- Get current date in YYYYMMDD format
    current_date := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Find the last order number for this table and date
    SELECT COALESCE(MAX(
        CASE 
            WHEN order_number ~ ('^' || table_number || current_date || '[0-9]{3}$')
            THEN CAST(RIGHT(order_number, 3) AS INTEGER)
            ELSE 0
        END
    ), 0)
    INTO last_number
    FROM orders
    WHERE order_number LIKE table_number || current_date || '%';
    
    -- Calculate next number
    next_number := last_number + 1;
    
    -- Format result as: TABLE_NUMBER + YYYYMMDD + 3-digit sequence
    result := table_number || current_date || LPAD(next_number::text, 3, '0');
    
    RETURN result;
END;
$$; 