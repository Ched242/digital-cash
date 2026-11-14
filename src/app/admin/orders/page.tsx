import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setOrderStatus, deliverOrderItem } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard');
  const { data: orders } = await supabase.from('orders').select('id,order_number,status,total,currency,created_at,order_items(id,product_name_snapshot,quantity,deliveries(id,status,delivery_content))').order('created_at', { ascending: false }).limit(100);
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span> / ADMIN</Link><Link className="text-link" href="/admin">← Tableau de bord</Link></header>
    <section className="dashboard-welcome"><p className="eyebrow">TRAITEMENT DES ACHATS</p><h1>Commandes & livraisons</h1><p>Les commandes ne peuvent être livrées qu'après confirmation du paiement par un fournisseur.</p></section>
    <section className="orders-panel"><h2>Commandes ({orders?.length ?? 0})</h2>
      {!orders?.length ? <div className="empty-state"><h3>Aucune commande</h3><p>Les nouvelles commandes apparaîtront ici.</p></div> : (orders ?? []).map(order => <article className="admin-order-card" key={order.id}>
        <div className="section-heading"><div><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleString('fr-FR')}</small></div><span className="order-status">{order.status}</span><strong>{Number(order.total).toFixed(2)} {order.currency}</strong></div>
        {(order.order_items ?? []).map(item => <div className="admin-order-item" key={item.id}><div><strong>{item.product_name_snapshot} × {item.quantity}</strong>{(item.deliveries ?? []).map(d => <small key={d.id}>Livraison : {d.status}</small>)}</div>
          {['paid','processing'].includes(order.status) && !(item.deliveries ?? []).some(d => d.status === 'delivered') && <form action={deliverOrderItem} className="delivery-form"><input type="hidden" name="order_id" value={order.id}/><input type="hidden" name="order_item_id" value={item.id}/><textarea name="delivery_content" placeholder="Code, identifiant ou instructions de livraison" required maxLength={10000}/><button className="button button-small" type="submit">Livrer cet article</button></form>}
        </div>)}
        {['paid','processing'].includes(order.status) && <form action={setOrderStatus} className="ticket-status-form"><input type="hidden" name="id" value={order.id}/><select name="status" defaultValue={order.status}><option value="processing">En traitement</option><option value="failed">Échouée</option><option value="cancelled">Annulée</option></select><button className="button button-small" type="submit">Mettre à jour</button></form>}
      </article>)}
    </section>
  </main>;
}
