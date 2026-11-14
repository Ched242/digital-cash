import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from('products')
    .select('id, name, slug, description, product_type, currency, price, image_url')
    .eq('is_active', true).eq('stock_status', 'available').order('created_at', { ascending: false }).limit(60);
  return <main className="catalog-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span></Link><div className="actions"><Link className="login" href="/dashboard">Mon espace</Link><Link className="button button-small" href="/login">Connexion</Link></div></header>
    <section className="catalog-heading"><p className="eyebrow">LE CATALOGUE DIGITAL</p><h1>Explorez nos produits</h1><p>Cartes cadeaux, recharges, jeux et services numériques.</p></section>
    {error ? <p className="form-error">Le catalogue est momentanément indisponible. Vérifiez la configuration Supabase.</p> :
    !products?.length ? <div className="empty-state"><span>🛍️</span><h2>Le catalogue se prépare</h2><p>Les produits publiés par l'équipe apparaîtront ici. Aucun produit fictif n'est affiché.</p></div> :
    <section className="product-grid">{products.map(product => <article className="product-card" key={product.id}>{product.image_url ? <img src={product.image_url} alt="" /> : <div className="product-placeholder">✦</div>}<div className="product-content"><span className="product-type">{product.product_type}</span><h2>{product.name}</h2><p>{product.description ?? 'Produit numérique'}</p><strong>{Number(product.price).toFixed(2)} {product.currency}</strong></div></article>)}</section>}
    <Link className="back-link" href="/">← Accueil</Link>
  </main>;
}
