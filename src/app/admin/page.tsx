import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions/auth';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard');
  const [{ count: products }, { count: orders }, { count: customers }, { data: latestOrders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, order_number, status, total, currency, created_at').order('created_at', { ascending: false }).limit(10),
  ]);
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span> / ADMIN</Link><form action={signOut}><button className="button button-small">Déconnexion</button></form></header>
    <section className="dashboard-welcome"><p className="eyebrow">ADMINISTRATION SÉCURISÉE</p><h1>Tableau de bord</h1><p>Vue d'ensemble de votre marketplace.</p></section>
    <section className="dashboard-stats"><article><span>Produits</span><strong>{products ?? 0}</strong></article><article><span>Commandes</span><strong>{orders ?? 0}</strong></article><article><span>Clients</span><strong>{customers ?? 0}</strong></article></section>
    <section className="orders-panel"><div className="section-heading"><div><p className="eyebrow">OUTILS ADMIN</p><h2>Gestion de la plateforme</h2></div><Link className="button button-small" href="/admin/products">Gérer les produits</Link></div><div className="section-heading"><div><p className="eyebrow">GESTION</p><h2>Dernières commandes</h2></div><Link className="text-link" href="/products">Voir le catalogue →</Link></div>
      {!latestOrders?.length ? <div className="empty-state"><h3>Aucune commande enregistrée</h3><p>Les commandes apparaîtront ici après les premiers achats.</p></div> :
      <div className="orders-list">{latestOrders.map(o => <article className="order-row" key={o.id}><div><strong>{o.order_number}</strong><small>{new Date(o.created_at).toLocaleString('fr-FR')}</small></div><span className="order-status">{o.status}</span><strong>{Number(o.total).toFixed(2)} {o.currency}</strong></article>)}</div>}
    </section>
  </main>;
}
