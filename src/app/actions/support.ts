'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createSupportTicket(data: FormData) {
  const subject = String(data.get('subject') ?? '').trim();
  const message = String(data.get('message') ?? '').trim();
  if (subject.length < 4 || subject.length > 160 || message.length < 10 || message.length > 5000) {
    redirect('/support?error=invalid');
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id, subject, message,
  });
  if (error) redirect('/support?error=save');
  revalidatePath('/support');
  redirect('/support?success=sent');
}
