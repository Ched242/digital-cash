'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function signIn(data: FormData) {
  const email = value(data, 'email').toLowerCase();
  const password = value(data, 'password');
  if (!email || !password) redirect('/login?error=missing');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=credentials');
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(data: FormData) {
  const fullName = value(data, 'full_name');
  const email = value(data, 'email').toLowerCase();
  const password = value(data, 'password');
  if (!fullName || !email || password.length < 8) redirect('/register?error=invalid');
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { error } = await supabase.auth.signUp({
    email, password, options: {
      data: { full_name: fullName },
      emailRedirectTo: appUrl ? new URL('/auth/confirm', appUrl).toString() : undefined,
    },
  });
  if (error) redirect('/register?error=signup');
  redirect('/register?success=check-email');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
