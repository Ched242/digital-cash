import Link from 'next/link';
import { signIn } from '@/app/actions/auth';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/">DIGITAL<span>CASH</span></Link>
    <p className="eyebrow">BON RETOUR</p><h1>Connectez-vous</h1>
    <p className="auth-muted">Accédez à votre espace et retrouvez vos commandes.</p>
    {error && <p className="form-error">{error === 'credentials' ? 'Identifiants incorrects.' : 'Vérifiez vos informations.'}</p>}
    <form action={signIn} className="auth-form">
      <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required /></label>
      <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
      <button className="button" type="submit">Se connecter</button>
    </form>
    <p className="auth-foot">Pas encore de compte ? <Link href="/register">Créer un compte</Link></p>
    <Link className="back-link" href="/">← Retour à l'accueil</Link>
  </section></main>;
}
