import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setTicketStatus } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard');
  const [{ data: tickets }, params] = await Promise.all([
    supabase.from('support_tickets').select('id,user_id,subject,message,status,created_at').order('created_at', { ascending: false }).limit(100),
    searchParams,
  ]);
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span> / ADMIN</Link><Link className="text-link" href="/admin">← Tableau de bord</Link></header>
    <section className="dashboard-welcome"><p className="eyebrow">SERVICE CLIENT</p><h1>Demandes d'assistance</h1><p>Consultez et mettez à jour les demandes des clients.</p></section>
    {params.error && <p className="form-error">La mise à jour n'a pas abouti.</p>}
    {params.success && <p className="form-success">Statut mis à jour.</p>}
    <section className="orders-panel"><h2>Tickets ({tickets?.length ?? 0})</h2>
      {!tickets?.length ? <p className="auth-muted">Aucune demande reçue.</p> : (tickets ?? []).map(ticket => <article className="ticket-card" key={ticket.id}>
        <div><strong>{ticket.subject}</strong><small>{new Date(ticket.created_at).toLocaleString('fr-FR')} · Client {ticket.user_id.slice(0,8)}</small></div>
        <p>{ticket.message}</p>
        <form action={setTicketStatus} className="ticket-status-form"><input type="hidden" name="id" value={ticket.id}/><select name="status" defaultValue={ticket.status}><option value="open">Ouvert</option><option value="in_progress">En cours</option><option value="resolved">Résolu</option><option value="closed">Fermé</option></select><button className="button button-small">Mettre à jour</button></form>
      </article>)}
    </section>
  </main>;
}
