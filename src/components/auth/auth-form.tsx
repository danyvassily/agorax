"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Sparkles,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Camera,
  Trash2,
  UploadCloud,
  KeyRound,
  Send,
  Trophy,
} from "lucide-react";
import { useAuth, compressProfilePhoto } from "@/lib/auth/use-auth";
import { MIN_ACCOUNT_PASSWORD_LENGTH, validateNewPassword } from "@/lib/auth/password";
import { useLanguageStore } from "@/lib/store/language";
import { translate, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from "@/lib/i18n";
import { PlayerDot } from "@/components/ui/primitives";
import { KawaiiMascot } from "@/components/ui/kawaii-mascot";

type AuthView = "register" | "login" | "forgot" | "recovery";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minimumLength = MIN_ACCOUNT_PASSWORD_LENGTH,
  showMinimum = true,
  language = "fr",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minimumLength?: number;
  showMinimum?: boolean;
  language?: "fr" | "en";
}) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-fp-text-dim">
        {label}
        {showMinimum ? language === "fr" ? ` (${minimumLength} caractères minimum)` : ` (${minimumLength} characters minimum)` : ""}
      </label>
      <div className="relative flex items-center">
        <Lock className="absolute left-3.5 h-4.5 w-4.5 text-fp-text-dim" />
        <input
          type="password"
          required
          minLength={minimumLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="fp-input w-full py-3 pl-10 pr-4 text-[15px]"
          placeholder="••••••••"
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}

function StatusMessage({ kind, children }: { kind: "error" | "success"; children: string }) {
  return (
    <p
      className={`mt-4 rounded-xl p-3 text-[13px] font-semibold ${
        kind === "error"
          ? "bg-fp-danger/10 text-fp-danger animate-shake"
          : "bg-fp-success/10 text-fp-success animate-rise"
      }`}
    >
      {children}
    </p>
  );
}

export function AuthForm({ mode: initialMode = "register" }: { mode?: AuthView }) {
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    requestPasswordReset,
    changePassword,
    completePasswordRecovery,
    updateName,
    updateAvatar,
  } = useAuth();
  const lang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const [mode, setMode] = useState<AuthView>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const t = (k: string) => translate(lang, k);
  const requiredPasswordLength = mode === "register" ? MIN_ACCOUNT_PASSWORD_LENGTH : 6;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, isProfileEdit = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingAvatar(true);
    try {
      const compressed = await compressProfilePhoto(file, 256);
      if (isProfileEdit) {
        await updateAvatar(compressed);
        setSuccessMessage(lang === "fr" ? "Photo de profil mise à jour !" : "Profile picture updated!");
      } else {
        setAvatarPreview(compressed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du traitement de l'image.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError(null);
      setSubmitting(true);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion avec Google");
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        await requestPasswordReset(email);
        setSuccessMessage(
          lang === "fr"
            ? "Si un compte correspond à cette adresse, un lien sécurisé vient d’être envoyé."
            : "If an account matches this address, a secure reset link has been sent.",
        );
        return;
      }

      if (mode === "recovery") {
        const validationError = validateNewPassword(newPassword, passwordConfirmation);
        if (validationError) throw new Error(validationError);
        await completePasswordRecovery(newPassword);
        setSuccessMessage(
          lang === "fr"
            ? "Mot de passe modifié. Votre session reste connectée."
            : "Password updated. Your session remains signed in.",
        );
        setNewPassword("");
        setPasswordConfirmation("");
        setTimeout(() => router.replace("/auth"), 1200);
        return;
      }

      if (mode === "register") {
        const res = await signUp({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          avatarUrl: avatarPreview,
          language: lang,
        });
        if (res.message) {
          setSuccessMessage(res.message);
        } else {
          setSuccessMessage(
            lang === "fr"
              ? "Compte créé avec succès ! Vos parties et statistiques sont sauvegardées."
              : "Account created successfully! Your games and stats are saved.",
          );
          setTimeout(() => {
            router.push("/play/online");
          }, 1200);
        }
      } else {
        await signIn({ email, password });
        setSuccessMessage(lang === "fr" ? "Connexion réussie !" : "Signed in successfully!");
        setTimeout(() => {
          router.push("/play/online");
        }, 800);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        setError(t("auth.error.invalid"));
      } else if (msg.includes("already") || msg.includes("already_registered")) {
        setError(t("auth.error.exists"));
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateNewPassword(newPassword, passwordConfirmation);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setEditingPassword(false);
      setSuccessMessage(
        lang === "fr" ? "Mot de passe modifié avec succès." : "Password changed successfully.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "forgot" || mode === "recovery") {
    const isRecovery = mode === "recovery";
    return (
      <div className="fp-card w-full p-6 animate-rise shadow-lg border border-black/[0.04]">
        {!isRecovery && (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccessMessage(null);
            }}
            className="mb-4 flex items-center gap-1 text-[15px] font-medium text-fp-primary hover:underline"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{lang === "fr" ? "Retour à la connexion" : "Back to sign in"}</span>
          </button>
        )}

        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-fp-primary/10 text-fp-primary">
          {isRecovery ? <KeyRound className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>
        <h2 className="text-[22px] font-bold tracking-tight text-fp-text">
          {isRecovery
            ? lang === "fr"
              ? "Nouveau mot de passe"
              : "New password"
            : lang === "fr"
              ? "Mot de passe oublié"
              : "Forgot your password?"}
        </h2>
        <p className="mt-1 text-[13px] text-fp-text-dim">
          {isRecovery
            ? lang === "fr"
              ? "Choisissez un mot de passe que vous n’utilisez pas ailleurs."
              : "Choose a password you do not use elsewhere."
            : lang === "fr"
              ? "Saisissez votre email et nous vous enverrons un lien sécurisé."
              : "Enter your email and we will send you a secure reset link."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isRecovery ? (
            <>
              <PasswordField
                language={lang}
                label={lang === "fr" ? "Nouveau mot de passe" : "New password"}
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordField
                language={lang}
                label={lang === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                autoComplete="new-password"
              />
            </>
          ) : (
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-fp-text-dim">
                {t("auth.email")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-fp-text-dim" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="fp-input w-full py-3 pl-10 pr-4 text-[15px]"
                  placeholder="toi@exemple.fr"
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {error && <StatusMessage kind="error">{error}</StatusMessage>}
          {successMessage && <StatusMessage kind="success">{successMessage}</StatusMessage>}

          <button
            type="submit"
            disabled={
              submitting ||
              (!isRecovery && !email) ||
              (isRecovery &&
                (newPassword.length < MIN_ACCOUNT_PASSWORD_LENGTH || !passwordConfirmation))
            }
            className="fp-btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-[15px] disabled:opacity-40"
          >
            <KeyRound className="h-4 w-4" />
            {submitting
              ? lang === "fr"
                ? "Patientez…"
                : "Please wait…"
              : isRecovery
                ? lang === "fr"
                  ? "Enregistrer le nouveau mot de passe"
                  : "Save new password"
                : lang === "fr"
                  ? "Envoyer le lien"
                  : "Send reset link"}
          </button>
        </form>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté avec un compte
  if (!loading && isLoggedIn && user) {
    return (
      <div className="fp-card w-full p-6 text-center animate-rise shadow-md border border-black/[0.04]">
        <div className="mx-auto flex justify-center mb-2">
          <KawaiiMascot theme="party" size={72} className="border border-black/[0.04] shadow-xs" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-fp-success/15 px-3.5 py-1 text-[13px] font-semibold text-fp-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>{lang === "fr" ? "Compte actif & synchronisé" : "Account active & synced"}</span>
        </div>

        {/* Section Photo de profil & Pseudo */}
        <div className="mt-5 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Avatar interactif avec bouton upload */}
            <div className="relative group">
              <PlayerDot
                name={user.name}
                avatarUrl={user.avatarUrl}
                colorIndex={0}
                size={74}
              />
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-fp-primary text-white shadow-md transition hover:scale-105 active:scale-95"
                title={lang === "fr" ? "Changer la photo" : "Change profile picture"}
                aria-label={lang === "fr" ? "Changer la photo de profil" : "Change profile picture"}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, true)}
              />
            </div>

            <div className="text-center sm:text-left">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="fp-input px-2.5 py-1 text-[16px] font-bold"
                    maxLength={24}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (editedName.trim()) await updateName(editedName);
                      setEditingName(false);
                    }}
                    className="fp-btn-primary px-3 py-1 text-[13px]"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[19px] font-bold text-fp-text flex items-center justify-center sm:justify-start gap-2">
                    {user.name}
                    <button
                      type="button"
                      onClick={() => {
                        setEditedName(user.name);
                        setEditingName(true);
                      }}
                      className="text-[12px] font-normal text-fp-primary hover:underline"
                    >
                      ({lang === "fr" ? "modifier" : "edit"})
                    </button>
                  </p>
                  <p className="text-[13px] text-fp-text-dim">{user.email || (lang === "fr" ? "Compte local persistant" : "Persistent local account")}</p>
                </div>
              )}

              {/* Boutons photo profil */}
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-[12px] font-semibold text-fp-primary hover:underline flex items-center gap-1"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>{uploadingAvatar ? (lang === "fr" ? "Chargement…" : "Uploading…") : (lang === "fr" ? "Changer la photo" : "Change picture")}</span>
                </button>
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => updateAvatar(null)}
                    className="text-[12px] font-medium text-fp-danger hover:underline flex items-center gap-1 ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{lang === "fr" ? "Supprimer" : "Remove"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <p className="mt-4 rounded-xl bg-fp-success/10 p-3 text-[13px] font-semibold text-fp-success animate-rise">
            {successMessage}
          </p>
        )}

        {/* Section Classement ELO */}
        <div className="mt-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-fp-primary/10 to-purple-500/10 p-4 text-left shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-600">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-fp-text-dim">{lang === "fr" ? "Classement ELO" : "ELO rating"}</p>
                <p className="text-xl font-black text-fp-text">
                  {user.eloRating ?? 1000} <span className="text-xs font-bold text-fp-text-dim">pts</span>
                </p>
              </div>
            </div>
            <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-bold text-fp-text shadow-xs">
              {(user.eloRating ?? 1000) >= 1500
                  ? (lang === "fr" ? "👑 Maître" : "👑 Master")
                : (user.eloRating ?? 1000) >= 1300
                  ? (lang === "fr" ? "🥇 Or" : "🥇 Gold")
                  : (user.eloRating ?? 1000) >= 1150
                    ? (lang === "fr" ? "🥈 Argent" : "🥈 Silver")
                    : "🥉 Bronze"}
            </span>
          </div>
          <p className="mt-2.5 text-[12px] text-fp-text-dim leading-relaxed">
            {lang === "fr"
              ? `${user.eloGamesPlayed ?? 0} partie(s) classée(s). Votre score s’ajuste selon vos résultats et le niveau de vos adversaires.`
              : `${user.eloGamesPlayed ?? 0} ranked game(s). Your rating adjusts to your results and your opponents’ level.`}
          </p>
        </div>

        {/* Avantages du compte actif */}
        <div className="mt-4 rounded-2xl bg-black/[0.02] p-4 text-left border border-black/[0.04]">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-fp-text">
            <ShieldCheck className="h-4 w-4 text-fp-success" />
            <span>{lang === "fr" ? "Historique anti-répétition protégé" : "Protected question history"}</span>
          </div>
          <p className="mt-1 text-[12px] text-fp-text-dim">
            {lang === "fr" ? "Vos parties et questions déjà vues sont synchronisées avec votre profil." : "Your games and previously seen questions are synced with your profile."}
          </p>
        </div>

        {/* Sécurité du compte */}
        <div className="mt-4 rounded-2xl border border-black/[0.04] bg-black/[0.02] p-4 text-left">
          <button
            type="button"
            onClick={() => {
              setEditingPassword((value) => !value);
              setError(null);
              setSuccessMessage(null);
            }}
            className="flex w-full items-center justify-between gap-3 text-[13px] font-semibold text-fp-text"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-fp-primary" />
              {lang === "fr" ? "Modifier mon mot de passe" : "Change my password"}
            </span>
            <span className="text-fp-primary">{editingPassword ? "−" : "+"}</span>
          </button>

          {editingPassword && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <PasswordField
                language={lang}
                label={lang === "fr" ? "Mot de passe actuel" : "Current password"}
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
                minimumLength={1}
                showMinimum={false}
              />
              <PasswordField
                language={lang}
                label={lang === "fr" ? "Nouveau mot de passe" : "New password"}
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <PasswordField
                language={lang}
                label={lang === "fr" ? "Confirmer le nouveau mot de passe" : "Confirm new password"}
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={
                  submitting ||
                  !currentPassword ||
                  newPassword.length < MIN_ACCOUNT_PASSWORD_LENGTH ||
                  !passwordConfirmation
                }
                className="fp-btn-secondary w-full py-2.5 text-[13px] disabled:opacity-40"
              >
                {submitting
                  ? lang === "fr"
                    ? "Modification…"
                    : "Updating…"
                  : lang === "fr"
                    ? "Enregistrer le mot de passe"
                    : "Save password"}
              </button>
            </form>
          )}
        </div>

        {error && <StatusMessage kind="error">{error}</StatusMessage>}

        {/* Choix de langue */}
        <div className="mt-5 text-left">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-fp-text-dim">
            {t("profile.language")}
          </p>
          <div className="mt-2 flex gap-2">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition ${
                  lang === l
                    ? "bg-fp-primary text-white shadow-xs"
                    : "bg-black/[0.04] text-fp-text hover:bg-black/[0.07]"
                }`}
              >
                {LANGUAGE_NAMES[l]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => router.push("/play/online")}
            className="fp-btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-[15px]"
          >
            <span>{lang === "fr" ? "Jouer en ligne dans un salon" : "Play in an online room"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={signOut}
            className="fp-btn-ghost w-full py-2.5 text-[14px] text-fp-danger flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("auth.logout")}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-card w-full p-6 animate-rise shadow-lg border border-black/[0.04]">
      {/* Onglets Création de compte / Connexion */}
      <div className="flex rounded-2xl bg-black/[0.05] p-1 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 rounded-xl py-2.5 text-[14px] font-bold transition-all ${
            mode === "register"
              ? "bg-white text-fp-text shadow-xs"
              : "text-fp-text-dim hover:text-fp-text"
          }`}
        >
          {lang === "fr" ? "Créer un compte" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 rounded-xl py-2.5 text-[14px] font-bold transition-all ${
            mode === "login"
              ? "bg-white text-fp-text shadow-xs"
              : "text-fp-text-dim hover:text-fp-text"
          }`}
        >
          {lang === "fr" ? "Se connecter" : "Sign in"}
        </button>
      </div>

      <header className="mb-4">
        <h2 className="text-[22px] font-bold tracking-tight text-fp-text">
          {mode === "register" ? (lang === "fr" ? "Créez votre profil joueur" : "Create your player profile") : (lang === "fr" ? "Bon retour parmi nous" : "Welcome back")}
        </h2>
        <p className="mt-1 text-[13px] text-fp-text-dim">
          {mode === "register"
            ? (lang === "fr" ? "Ajoutez une photo et synchronisez votre historique." : "Add a picture and sync your history.")
            : (lang === "fr" ? "Connectez-vous pour retrouver vos salons et votre historique." : "Sign in to access your rooms and history.")}
        </p>
      </header>

      {/* Bouton de connexion Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white py-3.5 px-4 text-[15px] font-bold text-fp-text shadow-xs transition-all hover:bg-black/[0.02] hover:border-black/20 active:scale-[0.99] disabled:opacity-50"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {mode === "register"
            ? (lang === "fr" ? "S'inscrire avec Google" : "Sign up with Google")
            : (lang === "fr" ? "Continuer avec Google" : "Continue with Google")}
        </span>
      </button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-black/10" />
        <span className="absolute bg-white px-3 text-[12px] font-semibold text-fp-text-dim">
          {lang === "fr" ? "ou par email" : "or with email"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            {/* Upload de photo lors de l'inscription */}
            <div className="flex items-center gap-3.5 mb-3 p-3 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
              <div className="relative group shrink-0">
                <PlayerDot
                  name={name || "J"}
                  avatarUrl={avatarPreview}
                  colorIndex={0}
                  size={54}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-fp-primary text-white shadow-sm"
                  aria-label={lang === "fr" ? "Télécharger une photo de profil" : "Upload a profile picture"}
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-fp-text">{lang === "fr" ? "Photo de profil (optionnel)" : "Profile picture (optional)"}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[12px] font-semibold text-fp-primary hover:underline"
                  >
                    {avatarPreview ? (lang === "fr" ? "Changer la photo" : "Change picture") : (lang === "fr" ? "Télécharger une photo" : "Upload picture")}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(null)}
                      className="text-[12px] font-medium text-fp-danger hover:underline"
                    >
                      {lang === "fr" ? "Retirer" : "Remove"}
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, false)}
              />
            </div>

            <label className="block text-[13px] font-semibold text-fp-text-dim mb-1">
              {t("auth.name")} / {lang === "fr" ? "Pseudo" : "Username"}
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4.5 w-4.5 text-fp-text-dim" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="fp-input w-full pl-10 pr-4 py-3 text-[15px]"
                placeholder={lang === "fr" ? "Ex : Dany" : "E.g. Dany"}
                maxLength={24}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-semibold text-fp-text-dim mb-1">
            {t("auth.email")}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4.5 w-4.5 text-fp-text-dim" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fp-input w-full pl-10 pr-4 py-3 text-[15px]"
              placeholder="toi@exemple.fr"
              autoComplete="email"
            />
          </div>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setSuccessMessage(null);
              }}
              className="mt-2 text-[12px] font-semibold text-fp-primary hover:underline"
            >
              {lang === "fr" ? "Mot de passe oublié ?" : "Forgot your password?"}
            </button>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-fp-text-dim mb-1">
            {t("auth.password")} ({requiredPasswordLength} {lang === "fr" ? "caractères minimum" : "characters minimum"})
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4.5 w-4.5 text-fp-text-dim" />
            <input
              type="password"
              required
              minLength={requiredPasswordLength}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="fp-input w-full pl-10 pr-4 py-3 text-[15px]"
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
        </div>

        {mode === "register" && (
          <div>
            <span className="block text-[13px] font-semibold text-fp-text-dim mb-1">
              {lang === "fr" ? "Langue préférée" : "Preferred language"}
            </span>
            <div className="flex gap-2">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition ${
                    lang === l
                      ? "bg-fp-primary text-white shadow-xs"
                      : "bg-black/[0.04] text-fp-text hover:bg-black/[0.07]"
                  }`}
                >
                  {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-fp-danger/10 p-3 text-[13px] font-semibold text-fp-danger animate-shake">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="rounded-xl bg-fp-success/10 p-3 text-[13px] font-semibold text-fp-success animate-rise">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            !email ||
            password.length < requiredPasswordLength ||
            (mode === "register" && !name.trim())
          }
          className="fp-btn-primary mt-3 w-full py-4 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Sparkles className="h-4.5 w-4.5" />
          <span>
            {submitting
              ? (lang === "fr" ? "Patientez…" : "Please wait…")
              : mode === "register"
                ? (lang === "fr" ? "Créer mon compte joueur" : "Create my player account")
                : (lang === "fr" ? "Se connecter" : "Sign in")}
          </span>
        </button>
      </form>

      {/* Rassurance / Bénéfices */}
      <div className="mt-6 border-t border-black/[0.05] pt-4 text-center">
        <p className="text-[12px] text-fp-text-dim">
          {lang === "fr" ? "✨ 100% gratuit. Vos questions déjà vues sont exclues automatiquement." : "✨ 100% free. Previously seen questions are excluded automatically."}
        </p>
      </div>
    </div>
  );
}
