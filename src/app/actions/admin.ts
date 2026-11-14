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
  if (!name || !slug || !productType || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(price) || price < 0) {
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
