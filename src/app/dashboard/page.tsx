import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('full_name, preferred_language').eq('id', user.id).maybeSingle(),
    supabase.from('orders').select('id, order_number, status, total, currency, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span></Link><form action={signOut}><button className="button button-small">Déconnexion</button></form></header>
    <section className="dashboard-welcome"><p className="eyebrow">ESPACE PERSONNEL</p><h1>Bonjour{profile?.full_name ? ', ' + profile.full_name : ''}.</h1><p>Bienvenue dans votre espace DIGITAL CASH.</p></section>
    <section className="dashboard-stats"><article><span>Commandes récentes</span><strong>{orders?.length ?? 0}</strong></article><article><span>Compte</span><strong>Actif</strong></article><article><span>Langue</span><strong>{(profile?.preferred_language ?? 'fr').toUpperCase()}</strong></article></section>
    <section className="orders-panel"><div className="section-heading"><div><p className="eyebrow">SUIVI</p><h2>Mes commandes</h2></div><div className="actions"><Link className="text-link" href="/support">Centre d’aide</Link><Link className="text-link" href="/products">Voir les produits →</Link></div></div>
      {!orders?.length ? <div className="empty-state"><span>🧾</span><h3>Aucune commande pour le moment</h3><p>Vos commandes apparaîtront ici après vos premiers achats.</p><Link className="button" href="/products">Découvrir le catalogue</Link></div> :
      <div className="orders-list">{orders.map(order => <Link className="order-row order-row-link" href={`/orders/${order.id}`} key={order.id}><div><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString('fr-FR')}</small></div><span className="order-status">{order.status.replaceAll('_',' ')}</span><strong>{Number(order.total).toFixed(2)} {order.currency}</strong></Link>)}</div>}
    </section>
  </main>;
}
