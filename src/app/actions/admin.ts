'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') redirect('/dashboard');
  return supabase;
}

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function createProduct(data: FormData) {
  const supabase = await requireAdmin();
  const name = text(data, 'name');
  const slug = text(data, 'slug').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const productType = text(data, 'product_type');
  const currency = text(data, 'currency').toUpperCase();
  const price = Number(text(data, 'price'));
  const categoryId = text(data, 'category_id') || null;
  const description = text(data, 'description');
  const deliveryType = text(data, 'delivery_type') || 'manual';
  const types = ['gift_card', 'mobile_topup', 'data_bundle', 'gaming_credit', 'subscription', 'software', 'other'];
  if (!name || !slug || !types.includes(productType) || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(price) || price < 0 || !['manual', 'automatic'].includes(deliveryType)) {
    redirect('/admin/products?error=invalid');
  }
  const { error } = await supabase.from('products').insert({
    name, slug, product_type: productType, currency, price, category_id: categoryId,
    description: description || null, delivery_type: deliveryType,
    stock_status: 'available', is_active: false, region_codes: [],
  });
  if (error) redirect('/admin/products?error=save');
  revalidatePath('/admin/products');
  redirect('/admin/products?success=created');
}

export async function setProductStatus(data: FormData) {
  const supabase = await requireAdmin();
  const id = text(data, 'id');
  const active = text(data, 'active') === 'true';
  if (!id) redirect('/admin/products?error=invalid');
  const { error } = await supabase.from('products').update({ is_active: active }).eq('id', id);
  if (error) redirect('/admin/products?error=save');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  redirect('/admin/products?success=updated');
}

export async function setTicketStatus(data: FormData) {
  const supabase = await requireAdmin();
  const id = text(data, 'id');
  const status = text(data, 'status');
  if (!id || !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
    redirect('/admin/support?error=invalid');
  }
  const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
  if (error) redirect('/admin/support?error=save');
  revalidatePath('/admin/support');
  redirect('/admin/support?success=updated');
}

export async function setOrderStatus(data: FormData) {
  const supabase = await requireAdmin();
  const id = text(data, 'id');
  const status = text(data, 'status');
  if (!id || !['processing', 'failed', 'cancelled'].includes(status)) redirect('/admin/orders?error=invalid');
  const { data: order } = await supabase.from('orders').select('id,status').eq('id', id).maybeSingle();
  if (!order || !['paid', 'processing'].includes(order.status)) redirect('/admin/orders?error=unpaid');
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) redirect('/admin/orders?error=save');
  revalidatePath('/admin/orders');
  revalidatePath('/dashboard');
  redirect('/admin/orders?success=updated');
}

export async function deliverOrderItem(data: FormData) {
  const supabase = await requireAdmin();
  const orderId = text(data, 'order_id');
  const itemId = text(data, 'order_item_id');
  const content = text(data, 'delivery_content');
  if (!orderId || !itemId || !content || content.length > 10000) redirect('/admin/orders?error=invalid');
  const [{ data: order }, { data: item }] = await Promise.all([
    supabase.from('orders').select('id,user_id,status').eq('id', orderId).maybeSingle(),
    supabase.from('order_items').select('id,order_id').eq('id', itemId).eq('order_id', orderId).maybeSingle(),
  ]);
  if (!order || !item || !['paid', 'processing'].includes(order.status)) redirect('/admin/orders?error=unpaid');
  const { data: existing } = await supabase.from('deliveries').select('id,status').eq('order_item_id', itemId).eq('status', 'delivered').maybeSingle();
  if (existing) redirect('/admin/orders?error=already-delivered');
  const { error: deliveryError } = await supabase.from('deliveries').insert({
    order_item_id: itemId, user_id: order.user_id, status: 'delivered',
    delivery_content: content, delivered_at: new Date().toISOString(),
  });
  if (deliveryError) redirect('/admin/orders?error=delivery');
  const { data: allItems } = await supabase.from('order_items').select('id').eq('order_id', orderId);
  const itemIds = (allItems ?? []).map(row => row.id);
  const { data: completed } = itemIds.length
    ? await supabase.from('deliveries').select('order_item_id').in('order_item_id', itemIds).eq('status', 'delivered')
    : { data: [] as { order_item_id: string }[] };
  const done = new Set((completed ?? []).map(row => row.order_item_id));
  const nextStatus = itemIds.every(id => done.has(id)) ? 'completed' : 'processing';
  const { error: orderError } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
  if (orderError) redirect('/admin/orders?error=order-update');
  revalidatePath('/admin/orders');
  revalidatePath('/dashboard');
  revalidatePath(`/orders/${orderId}`);
  redirect('/admin/orders?success=delivered');
}
