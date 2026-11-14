import Link from 'next/link';
import { signUp } from '@/app/actions/auth';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const { error, success } = await searchParams;
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/">DIGITAL<span>CASH</span></Link>
    <p className="eyebrow">REJOIGNEZ-NOUS</p><h1>Créer un compte</h1>
    <p className="auth-muted">Créez votre espace personnel DIGITAL CASH.</p>
    {error && <p className="form-error">Vérifiez vos informations. Le mot de passe doit contenir au moins 8 caractères.</p>}
    {success === 'check-email' && <p className="form-success">Compte créé. Consultez votre e-mail pour confirmer votre adresse.</p>}
    <form action={signUp} className="auth-form">
      <label>Nom complet<input name="full_name" autoComplete="name" required maxLength={100} /></label>
      <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required /></label>
      <label>Mot de passe<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
      <button className="button" type="submit">Créer mon compte</button>
    </form>
    <p className="auth-foot">Déjà inscrit ? <Link href="/login">Se connecter</Link></p>
    <Link className="back-link" href="/">← Retour à l'accueil</Link>
  </section></main>;
}
