const categories = [
  { title: 'Cartes cadeaux', description: 'Des cartes cadeaux pour vos plateformes préférées', symbol: '🎁' },
  { title: 'Recharge mobile', description: 'Crédit et forfaits pour rester connecté', symbol: '📱' },
  { title: 'Jeux vidéo', description: 'Crédits et contenus gaming', symbol: '🎮' },
  { title: 'Abonnements', description: 'Services numériques et divertissement', symbol: '▶️' },
  { title: 'Logiciels', description: 'Outils et licences numériques', symbol: '💻' },
  { title: 'Internet', description: 'Forfaits et données mobiles', symbol: '🌐' },
];

export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/">DIGITAL<span>CASH</span></a>
        <nav aria-label="Navigation principale">
          <a href="#categories">Catégories</a>\n          <a href="/products">Catalogue</a>
          <a href="#how-it-works">Comment ça marche</a>
        </nav>
        <div className="actions">
          <a className="login" href="/login">Connexion</a>
          <a className="button button-small" href="/register">Créer un compte</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">VOTRE UNIVERS NUMÉRIQUE, AU MÊME ENDROIT</p>
          <h1>Le digital, <span>en toute simplicité.</span></h1>
          <p className="intro">Cartes cadeaux, recharges, jeux, abonnements et services numériques : retrouvez vos essentiels sur une seule plateforme.</p>
          <div className="hero-actions">
            <a className="button" href="/products">Explorer le catalogue</a>
            <a className="text-link" href="/register">Rejoindre DIGITAL CASH →</a>
          </div>
          <div className="trust-line"><span className="status-dot" /> Une plateforme pensée pour une expérience simple et transparente</div>
        </div>
        <div className="hero-panel" aria-label="Aperçu de la plateforme">
          <div className="panel-top"><span>VOTRE ESPACE DIGITAL</span><span className="panel-dot">● ● ●</span></div>
          <div className="panel-balance"><span>Un seul espace</span><strong>Des possibilités infinies.</strong><small>Découvrez, choisissez et gérez vos produits numériques.</small></div>
          <div className="panel-grid"><div>🎁<b>Gift cards</b></div><div>📱<b>Recharges</b></div><div>🎮<b>Gaming</b></div><div>🌐<b>Internet</b></div></div>
        </div>
      </section>

      <section className="categories" id="categories">
        <div className="section-heading"><div><p className="eyebrow">TOUT AU MÊME ENDROIT</p><h2>Explorez nos catégories</h2></div><p>Choisissez le service numérique qui vous convient.</p></div>
        <div className="category-grid">
          {categories.map((category) => <article className="category-card" key={category.title}><span className="category-icon">{category.symbol}</span><h3>{category.title}</h3><p>{category.description}</p><span className="card-arrow">↗</span></article>)}
        </div>
      </section>

      <section className="how" id="how-it-works"><p className="eyebrow">SIMPLE ET DIRECT</p><h2>Vos produits numériques, en quelques étapes.</h2><p>Créez votre compte, choisissez un produit et suivez votre commande depuis votre espace personnel.</p></section>
      <footer><a className="brand" href="/">DIGITAL<span>CASH</span></a><p>© {new Date().getFullYear()} DIGITAL CASH. Tous droits réservés.</p></footer>
    </main>
  );
}
