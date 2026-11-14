'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createOrderFromCart(data: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=checkout');

  let items: { product_id: string; quantity: number }[];
  try {
    const parsed: unknown = JSON.parse(String(data.get('items') ?? ''));
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 20) {
      redirect('/products?error=cart');
    }
    items = parsed.map((item: any) => ({
      product_id: String(item.product_id ?? ''),
      quantity: Number(item.quantity),
    }));
  } catch {
    redirect('/products?error=cart');
  }

  const { data: order, error } = await supabase.rpc('create_order_from_cart', { p_items: items });
  if (error || !order?.order_id) {
    const reason = error?.message?.includes('mixed_currency_cart') ? 'currency' : 'unavailable';
    redirect(`/products?error=${reason}`);
  }
  redirect(`/orders/${order.order_id}`);
}
