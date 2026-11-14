'use client';

import { useMemo, useState } from 'react';
import { createOrderFromCart } from '@/app/actions/checkout';

type Product = {
  id: string;
  name: string;
  description: string | null;
  product_type: string;
  currency: string;
  price: number;
  image_url: string | null;
};

export default function CatalogClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState('');
  const entries = useMemo(() => Object.entries(cart).filter(([, quantity]) => quantity > 0), [cart]);
  const totalItems = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find(item => item.id === id);
    return sum + (product ? Number(product.price) * quantity : 0);
  }, 0);
  const currencies = new Set(entries.map(([id]) => products.find(item => item.id === id)?.currency));
  const add = (id: string) => {
    setCart(current => ({ ...current, [id]: Math.min(10, (current[id] ?? 0) + 1) }));
    setNotice('');
  };
  const change = (id: string, delta: number) => setCart(current => ({ ...current, [id]: Math.max(0, Math.min(10, (current[id] ?? 0) + delta)) }));

  return <>
    {notice && <p className="form-error">{notice}</p>}
    <section className="product-grid">{products.map(product => <article className="product-card" key={product.id}>
      {product.image_url ? <img src={product.image_url} alt="" /> : <div className="product-placeholder">✦</div>}
      <div className="product-content"><span className="product-type">{product.product_type.replaceAll('_', ' ')}</span><h2>{product.name}</h2><p>{product.description ?? 'Produit numérique'}</p><strong>{Number(product.price).toFixed(2)} {product.currency}</strong>
        <button className="button add-cart-button" type="button" onClick={() => add(product.id)}>Ajouter au panier</button>
        {(cart[product.id] ?? 0) > 0 && <div className="quantity-control"><button type="button" onClick={() => change(product.id, -1)} aria-label="Retirer un article">−</button><span>{cart[product.id]}</span><button type="button" onClick={() => change(product.id, 1)} aria-label="Ajouter un article">+</button></div>}
      </div>
    </article>)}</section>
    {totalItems > 0 && <aside className="cart-panel"><div><p className="eyebrow">VOTRE PANIER</p><h2>{totalItems} article{totalItems > 1 ? 's' : ''}</h2><strong>{total.toFixed(2)} {currencies.size === 1 ? [...currencies][0] : 'devises mixtes'}</strong></div>
      {currencies.size > 1 ? <p className="form-error">Un panier doit utiliser une seule devise. Retirez les produits dans une autre devise.</p> :
      <form action={createOrderFromCart}><input type="hidden" name="items" value={JSON.stringify(entries.map(([product_id, quantity]) => ({ product_id, quantity })))} /><button className="button" type="submit">Créer ma commande</button><p className="auth-muted">Le paiement sera activé après la connexion d'un fournisseur agréé. Aucune somme n'est débitée maintenant.</p></form>}
    </aside>}
  </>;
}
