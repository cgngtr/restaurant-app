-- Enable RLS for menu related tables
alter table menu_items enable row level security;
alter table menu_categories enable row level security;

-- Drop existing policies if any
drop policy if exists "Enable read access for all users" on menu_items;
drop policy if exists "Enable insert access for all users" on menu_items;
drop policy if exists "Enable update access for all users" on menu_items;
drop policy if exists "Enable delete access for all users" on menu_items;

-- Create policies for menu_items
create policy "Enable read access for all users"
on menu_items for select
using (true);

create policy "Enable insert access for all users"
on menu_items for insert
with check (true);

create policy "Enable update access for all users"
on menu_items for update
using (true);

create policy "Enable delete access for all users"
on menu_items for delete
using (true);

-- Drop existing policies if any for menu_categories
drop policy if exists "Enable read access for all users" on menu_categories;
drop policy if exists "Enable insert access for all users" on menu_categories;
drop policy if exists "Enable update access for all users" on menu_categories;
drop policy if exists "Enable delete access for all users" on menu_categories;

-- Create policies for menu_categories
create policy "Enable read access for all users"
on menu_categories for select
using (true);

create policy "Enable insert access for all users"
on menu_categories for insert
with check (true);

create policy "Enable update access for all users"
on menu_categories for update
using (true);

create policy "Enable delete access for all users"
on menu_categories for delete
using (true); 