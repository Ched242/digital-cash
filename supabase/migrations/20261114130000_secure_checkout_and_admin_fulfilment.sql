alter table public.deliveries
  add column if not exists delivery_content text,
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz not null default now();

drop policy if exists orders_insert_own on public.orders;
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists deliveries_select_own_or_admin on public.deliveries;
create policy deliveries_select_own_or_admin on public.deliveries
  for select to authenticated
  using (
    ((select auth.uid()) = user_id and status = 'delivered')
    or (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists deliveries_admin_insert on public.deliveries;
create policy deliveries_admin_insert on public.deliveries
  for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists deliveries_admin_update on public.deliveries;
create policy deliveries_admin_update on public.deliveries
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.create_order_from_cart(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product record;
  v_order_id uuid;
  v_order_number text;
  v_currency text := null;
  v_subtotal numeric(12,2) := 0;
  v_quantity integer;
  v_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'invalid_cart' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_count := v_count + 1;
    if coalesce(v_item->>'product_id','') !~* '^[0-9a-f-]{36}$'
      or coalesce(v_item->>'quantity','') !~ '^[0-9]+$' then
      raise exception 'invalid_cart_item' using errcode = '22023';
    end if;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 10 then
      raise exception 'invalid_quantity' using errcode = '22023';
    end if;

    select id, name, price, currency, is_active, stock_status
      into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid
      for share;
    if not found or not v_product.is_active or v_product.stock_status <> 'available' then
      raise exception 'product_unavailable' using errcode = '22023';
    end if;
    if v_currency is null then
      v_currency := trim(v_product.currency::text);
    elsif v_currency <> trim(v_product.currency::text) then
      raise exception 'mixed_currency_cart' using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  v_order_number := 'DC-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.orders (user_id, order_number, status, currency, subtotal, fees, total)
  values (v_user_id, v_order_number, 'awaiting_payment', v_currency, v_subtotal, 0, v_subtotal)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    select id, name, price into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid;
    insert into public.order_items (order_id, product_id, product_name_snapshot, quantity, unit_price, line_total)
    values (v_order_id, v_product.id, v_product.name, v_quantity, v_product.price, v_product.price * v_quantity);
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_subtotal,
    'currency', v_currency
  );
end;
$$;

revoke all on function public.create_order_from_cart(jsonb) from public, anon;
grant execute on function public.create_order_from_cart(jsonb) to authenticated;
