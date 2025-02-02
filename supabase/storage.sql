-- First, enable RLS
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

-- Clear any existing policies
drop policy if exists "Allow all bucket access" on storage.buckets;
drop policy if exists "Allow all object access" on storage.objects;
drop policy if exists "Allow public select for menu-images" on storage.objects;
drop policy if exists "Allow public insert for menu-images" on storage.objects;
drop policy if exists "Allow public update for menu-images" on storage.objects;
drop policy if exists "Allow public delete for menu-images" on storage.objects;

-- Create a policy to allow public access to the menu-images bucket
create policy "Allow all bucket access"
on storage.buckets for all to public
using ( name = 'menu-images' );

-- Create a policy to allow public access to objects in menu-images bucket
create policy "Allow all object access"
on storage.objects for all to public
using ( bucket_id = 'menu-images' ); 