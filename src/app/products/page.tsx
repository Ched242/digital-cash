import Link from 'next/link';
import CatalogClient from './catalog-client';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from('products')
    .select('id, name, slug, description, product_type, currency, price, image_url')
    .eq('is_active', true).eq('stock_status', 'available').order('created_at', { ascending: false }).limit(60);
  const { error: queryError } = await searchParams;
  const message = queryError === 'currency'
    ? 'Votre panier contient plusieurs devises. Faites une commande par devise.'
    : queryError === 'unavailable' ? 'Un produit n’est plus disponible. Actualisez le catalogue.'
    : queryError === 'cart' ? 'Votre panier est invalide. Réessayez.'
    : null;
  return <main className="catalog-shell">
    <header className="dashboard-top"><Link className="brand" href="/">DIGITAL<span>CASH</span></Link><div className="actions"><Link className="login" href="/dashboard">Mon espace</Link><Link className="button button-small" href="/login">Connexion</Link></div></header>
    <section className="catalog-heading"><p className="eyebrow">LE CATALOGUE DIGITAL</p><h1>Explorez nos produits</h1><p>Cartes cadeaux, recharges, jeux et services numériques.</p></section>
    {message && <p className="form-error">{message}</p>}
    {error ? <p className="form-error">Le catalogue est momentanément indisponible. Vérifiez la configuration Supabase.</p> :
    !products?.length ? <div className="empty-state"><span>🛍️</span><h2>Le catalogue se prépare</h2><p>Les produits publiés par l'équipe apparaîtront ici. Aucun produit fictif n'est affiché.</p></div> :
    <CatalogClient products={products.map(p => ({...p, price: Number(p.price)}))} />}
    <Link className="back-link" href="/">← Accueil</Link>
  </main>;
}
