"use client";
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, Check, Settings, LoaderCircle, X, Sparkles, LogIn, LogOut, CheckCircle2, UserPlus } from 'lucide-react';
import { AppNavigation } from '@/components/ui/app-navigation';
import { PlayerDot } from '@/components/ui/primitives';
import { KawaiiMascot } from '@/components/ui/kawaii-mascot';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useAuth, compressProfilePhoto, type AuthUser } from '@/lib/auth/use-auth';
import { useLanguageStore } from '@/lib/store/language';
import { type UILanguage } from '@/lib/i18n';
import { CHARACTERS, characterImage } from '@/lib/characters';

export function ProfileClient({ character }: { character?: string }) {
  const { user } = useAuth();
  
  // Toujours un utilisateur actif (invité ou connecté) pour éviter tout blocage d'affichage
  const activeUser: AuthUser = user || {
    id: 'guest',
    name: 'Joueur',
    isAnonymous: true,
    avatarColor: 0,
    avatarUrl: null,
  };

  return (
    <>
      <AppNavigation />
      <main className="jx-page jx-profile-page">
        <ProfileEditor key={`${activeUser.id}-${character ?? ''}`} user={activeUser} character={character} />
      </main>
    </>
  );
}

function ProfileEditor({ user, character }: { user: AuthUser; character?: string }) {
  const { updateProfile, isLoggedIn, signInWithGoogle, signOut } = useAuth();
  const currentLanguage = useLanguageStore(s => s.language);
  const en = currentLanguage === 'en';

  const selectedCharacter = CHARACTERS.find(c => c.id === character);
  const [name, setName] = useState(user.name);
  const [language, setLanguage] = useState<UILanguage>(currentLanguage);
  const [avatar, setAvatar] = useState<string | null>(
    selectedCharacter ? characterImage(selectedCharacter.id) : user.avatarUrl ?? null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const dirty = () => setSaved(false);

  async function handleGoogleAuth() {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion Google');
      setGoogleLoading(false);
    }
  }

  async function photo(file?: File) {
    if (!file) return;
    setError('');
    setReading(true);
    try {
      setPreview(await compressProfilePhoto(file));
    } catch {
      setError(en ? 'Choose a JPG, PNG or WebP image smaller than 8 MB.' : 'Choisis une image JPG, PNG ou WebP de moins de 8 Mo.');
    } finally {
      setReading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function save() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name: name.trim(), avatarUrl: avatar, language });
      setSaved(true);
    } catch {
      setError(en ? 'Your changes could not be saved. Please try again.' : 'Les modifications n’ont pas pu être enregistrées. Réessaie.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="jx-page-title">
        <span className="jx-eyebrow">{en ? 'YOUR CORNER OF AGORAX' : 'TON COIN À TOI'}</span>
        <h1>{en ? 'My profile' : 'Mon profil'}</h1>
      </header>

      {/* Bannière de connexion Google / Inscription mise en avant */}
      {!isLoggedIn ? (
        <section className="mb-8 rounded-3xl border border-black/5 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fp-primary/10 px-3 py-1 text-xs font-bold text-fp-primary">
                <Sparkles size={14} />
                {en ? 'Guest Mode' : 'Mode Invité'}
              </span>
              <h2 className="mt-2 text-xl font-black text-fp-text">
                {en ? 'Sign in or create your account' : 'Connecte-toi ou crée ton compte'}
              </h2>
              <p className="mt-1 text-sm text-fp-text-dim">
                {en
                  ? 'Connect with Google in 1 click or create an account to save your ELO rating, quiz history, and play with friends.'
                  : 'Connecte-toi avec Google en 1 clic ou crée un compte pour conserver ton classement ELO, tes parties et jouer avec tes amis.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-fp-text shadow-xs hover:bg-black/[0.02] active:scale-95 transition disabled:opacity-50"
              >
                {googleLoading ? <LoaderCircle size={18} className="animate-spin" /> : <GoogleIcon className="h-4.5 w-4.5" />}
                <span>{en ? 'Sign in with Google' : 'Continuer avec Google'}</span>
              </button>
              <Link
                href="/auth?mode=login"
                className="fp-btn-secondary justify-center text-sm py-3 px-4 flex items-center gap-1.5"
              >
                <LogIn size={16} />
                <span>{en ? 'Sign in' : 'Connexion'}</span>
              </Link>
              <Link
                href="/auth?mode=register"
                className="fp-btn-primary justify-center text-sm py-3 px-4 flex items-center gap-1.5"
              >
                <UserPlus size={16} />
                <span>{en ? 'Create account' : 'Créer un compte'}</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-3xl border border-emerald-500/20 bg-emerald-50/40 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-fp-text">
                  {en ? 'Connected account' : 'Compte connecté'} : <span className="text-emerald-700">{user.email || user.name}</span>
                </p>
                <p className="text-xs text-fp-text-dim">
                  {en ? 'Your stats and games are synced in real time.' : 'Tes parties et statistiques sont synchronisées en temps réel.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link href="/auth" className="fp-btn-secondary text-xs py-2 px-3.5">
                {en ? 'Account settings' : 'Gérer mon compte'}
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="fp-btn-ghost text-xs py-2 px-3.5 text-fp-danger flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>{en ? 'Log out' : 'Déconnexion'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="jx-profile-grid">
        <section className="jx-profile-identity">
          <PlayerDot name={name} avatarUrl={avatar ?? characterImage('milo')} size={138} />
          <h2>{name}</h2>
          <p>
            {isLoggedIn
              ? (en ? 'Your AGORAX account' : 'Ton compte AGORAX')
              : (en ? 'Guest · Saved on this device' : 'Invité · Enregistré sur cet appareil')}
          </p>
          <button disabled={reading || busy} className="fp-btn-secondary" onClick={() => fileInput.current?.click()}>
            <Camera size={18} />
            {reading ? (en ? 'Reading image…' : 'Lecture de l’image…') : (en ? 'Add a photo' : 'Ajouter une photo')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={e => void photo(e.target.files?.[0])}
            className="sr-only"
            aria-label={en ? 'Profile photo' : 'Photo de profil'}
          />
          {avatar && (
            <button className="fp-btn-ghost" disabled={busy} onClick={() => { setAvatar(null); dirty(); }}>
              {en ? 'Remove photo' : 'Supprimer la photo'}
            </button>
          )}

          <h3>{en ? 'Or choose your teammate' : 'Ou choisis ton personnage'}</h3>
          <div className="jx-character-picker">
            {CHARACTERS.map(c => (
              <button
                key={c.id}
                aria-label={c.name}
                aria-pressed={avatar === characterImage(c.id)}
                disabled={busy}
                onClick={() => { setAvatar(characterImage(c.id)); dirty(); }}
                style={{ background: c.color }}
              >
                <KawaiiMascot theme={c.id} size={62} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {isLoggedIn && user.eloGamesPlayed !== undefined && (
            <div className="jx-profile-stats">
              <span>
                <strong>{user.eloGamesPlayed}</strong>
                {en ? 'ranked games' : 'parties classées'}
              </span>
              <span>
                <strong>{user.eloRating ?? 1000}</strong>ELO
              </span>
            </div>
          )}
        </section>

        <section className="jx-profile-form">
          <label>
            {en ? 'Nickname' : 'Pseudo'}
            <input
              className="fp-input"
              value={name}
              maxLength={24}
              disabled={busy}
              onChange={e => { setName(e.target.value); dirty(); }}
            />
          </label>
          <label>
            {en ? 'Application language' : 'Langue de l’application'}
            <select
              className="fp-input"
              value={language}
              disabled={busy}
              onChange={e => { setLanguage(e.target.value as UILanguage); dirty(); }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
            <small>{en ? 'The interface and questions, in your language.' : 'L’interface et les questions dans ta langue.'}</small>
          </label>

          <p className="jx-profile-note">
            {en
              ? 'Your character is your signature. Everyone plays by the same rules.'
              : 'Ton personnage, c’est ta signature. Les règles restent les mêmes pour tout le monde.'}
          </p>

          {error && <p className="jx-error" role="alert">{error}</p>}
          {saved && (
            <p className="jx-success" role="status">
              <Check size={18} />
              {en ? 'Profile saved' : 'Profil enregistré'}
            </p>
          )}

          <button
            className="fp-btn-primary"
            disabled={busy || reading || !name.trim()}
            onClick={() => void save()}
          >
            {busy ? <LoaderCircle size={18} className="animate-spin" /> : saved ? <Check size={18} /> : null}
            {en ? 'Save' : 'Enregistrer'}
          </button>

          <Link href="/settings" className="fp-btn-secondary">
            <Settings size={18} />
            {en ? 'Sound and game settings' : 'Son et réglages des jeux'}
          </Link>

          <Link href="/auth" className="fp-btn-ghost">
            {isLoggedIn
              ? (en ? 'Manage my account' : 'Gérer mon compte')
              : (en ? 'Sign in or create an account' : 'Se connecter ou créer un compte')}
          </Link>
        </section>
      </div>

      {preview && (
        <div className="jx-modal" role="dialog" aria-modal="true" aria-label={en ? 'Photo preview' : 'Aperçu de la photo'}>
          <div>
            <button className="jx-modal-close" aria-label={en ? 'Cancel' : 'Annuler'} onClick={() => setPreview(null)}>
              <X />
            </button>
            <h2>{en ? 'Your new photo' : 'Ta nouvelle photo'}</h2>
            <PlayerDot name={name} avatarUrl={preview} size={190} />
            <p>{en ? 'The image is cropped to a square and displayed in a circle.' : 'L’image est centrée et recadrée pour ton avatar.'}</p>
            <button autoFocus className="fp-btn-primary" onClick={() => { setAvatar(preview); setPreview(null); dirty(); }}>
              {en ? 'Use this photo' : 'Utiliser cette photo'}
            </button>
            <button className="fp-btn-ghost" onClick={() => setPreview(null)}>
              {en ? 'Cancel' : 'Annuler'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
