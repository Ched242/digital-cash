import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: order } = await supabase.from('orders').select('id,order_number,status,currency,subtotal,fees,total,created_at').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from('order_items').select('id,product_name_snapshot,quantity,unit_price,line_total').eq('order_id', order.id);
  const itemIds = (items ?? []).map(item => item.id);
  const { data: deliveries } = itemIds.length
    ? await supabase.from('deliveries').select('id,order_item_id,status,delivery_content,delivered_at').in('order_item_id', itemIds)
    : { data: [] as any[] };
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span></Link><Link className="text-link" href="/dashboard">← Mon espace</Link></header>
    <section className="dashboard-welcome"><p className="eyebrow">SUIVI DE COMMANDE</p><h1>{order.order_number}</h1><p>Créée le {new Date(order.created_at).toLocaleString('fr-FR')}</p></section>
    <section className="orders-panel"><div className="section-heading"><h2>Statut : {order.status.replaceAll('_', ' ')}</h2><span className="order-status">{order.status}</span></div>
      {(items ?? []).map(item => <article className="ticket-card" key={item.id}><strong>{item.product_name_snapshot}</strong><p>{item.quantity} × {Number(item.unit_price).toFixed(2)} {order.currency} — {Number(item.line_total).toFixed(2)} {order.currency}</p>
        {(deliveries ?? []).filter(delivery => delivery.order_item_id === item.id && delivery.status === 'delivered').map(delivery => <div className="delivery-secret" key={delivery.id}><p className="eyebrow">VOTRE LIVRAISON</p><pre>{delivery.delivery_content}</pre><small>Livré le {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleString('fr-FR') : '—'}</small></div>)}
      </article>)}
      <div className="order-total"><span>Total</span><strong>{Number(order.total).toFixed(2)} {order.currency}</strong></div>
      {order.status === 'awaiting_payment' && <p className="form-error">Votre commande est enregistrée, mais aucun fournisseur de paiement n'est encore connecté. Ne faites aucun transfert manuel à ce stade. Vous serez informé lorsque les paiements seront activés.</p>}
    </section>
  </main>;
}
