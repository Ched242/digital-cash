import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createSupportTicket } from '@/app/actions/support';

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const [{ data: tickets }, params] = await Promise.all([
    supabase.from('support_tickets').select('id,subject,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    searchParams,
  ]);
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span></Link><Link className="text-link" href="/dashboard">← Mon espace</Link></header>
    <section className="dashboard-welcome"><p className="eyebrow">ASSISTANCE</p><h1>Centre d'aide</h1><p>Envoyez une demande à notre équipe et suivez son traitement.</p></section>
    {params.error && <p className="form-error">Impossible d'envoyer le message. Vérifiez les champs puis réessayez.</p>}
    {params.success && <p className="form-success">Votre demande a bien été enregistrée.</p>}
    <section className="orders-panel"><h2>Nouvelle demande</h2><form action={createSupportTicket} className="auth-form">
      <label>Sujet<input name="subject" required minLength={4} maxLength={160} /></label>
      <label>Votre message<textarea name="message" required minLength={10} maxLength={5000} rows={6} /></label>
      <button className="button" type="submit">Envoyer la demande</button>
    </form></section>
    <section className="orders-panel admin-products-list"><h2>Mes demandes précédentes</h2>
      {!tickets?.length ? <p className="auth-muted">Aucune demande enregistrée.</p> : tickets.map(ticket => <article className="order-row" key={ticket.id}><div><strong>{ticket.subject}</strong><small>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</small></div><span className="order-status">{ticket.status}</span></article>)}
    </section>
  </main>;
}
