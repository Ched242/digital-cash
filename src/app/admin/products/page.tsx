import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createProduct, setProductStatus } from '@/app/actions/admin';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard');
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id,name,slug,product_type,price,currency,is_active,stock_status').order('created_at', { ascending: false }),
    supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
  ]);
  const { error, success } = await searchParams;
  return <main className="dashboard-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span> / ADMIN</Link><Link className="text-link" href="/admin">← Tableau de bord</Link></header>
    <section className="dashboard-welcome"><p className="eyebrow">CATALOGUE ADMINISTRATEUR</p><h1>Gérer les produits</h1><p>Les nouveaux produits sont masqués jusqu'à leur publication.</p></section>
    {error && <p className="form-error">Impossible d'enregistrer. Vérifiez les champs et l'unicité du slug.</p>}
    {success && <p className="form-success">Modification enregistrée.</p>}
    <section className="orders-panel"><h2>Ajouter un produit</h2><form action={createProduct} className="admin-product-form">
      <label>Nom du produit<input name="name" required maxLength={120} /></label>
      <label>Identifiant URL (slug)<input name="slug" required pattern="[a-zA-Z0-9-]+" placeholder="exemple-carte-cadeau" /></label>
      <label>Type de produit<select name="product_type" defaultValue="gift_card" required><option value="gift_card">Carte cadeau</option><option value="mobile_topup">Recharge mobile</option><option value="data_bundle">Forfait Internet</option><option value="gaming_credit">Crédit gaming</option><option value="subscription">Abonnement</option><option value="software">Logiciel</option><option value="other">Autre</option></select></label>
      <label>Catégorie<select name="category_id" defaultValue=""><option value="">Sans catégorie</option>{(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Prix<input name="price" type="number" min="0" step="0.01" required /></label>
      <label>Devise (3 lettres)<input name="currency" defaultValue="USD" minLength={3} maxLength={3} required /></label>
      <label>Mode de livraison<select name="delivery_type" defaultValue="manual"><option value="manual">Manuelle</option><option value="automatic">Automatique (à activer après intégration fournisseur)</option></select></label>
      <label className="wide">Description<textarea name="description" rows={3} maxLength={2000} /></label>
      <button className="button" type="submit">Enregistrer comme brouillon</button>
    </form></section>
    <section className="orders-panel admin-products-list"><h2>Produits enregistrés ({products?.length ?? 0})</h2>
      {!products?.length ? <p className="auth-muted">Aucun produit créé.</p> : (products ?? []).map(p => <article className="order-row" key={p.id}><div><strong>{p.name}</strong><small>{p.slug} · {p.product_type}</small></div><span className="order-status">{p.is_active ? 'Publié' : 'Brouillon'}</span><div className="admin-product-actions"><strong>{Number(p.price).toFixed(2)} {p.currency}</strong><form action={setProductStatus}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="active" value={p.is_active ? 'false' : 'true'}/><button className="text-link" type="submit">{p.is_active ? 'Dépublier' : 'Publier'}</button></form></div></article>)}
    </section>
  </main>;
}
