import Link from "next/link";
import { ArrowLeft, History, ShieldCheck, UsersRound } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { BrandMark } from "@/components/ui/app-navigation";
import { KawaiiMascot } from "@/components/ui/kawaii-mascot";
import { LocalizedText } from "@/components/ui/localized-text";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode = mode === "login" ? "login" : "register";

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between">
        <BrandMark />
        <Link href="/" className="fp-btn-ghost gap-2"><ArrowLeft className="h-4 w-4" /><LocalizedText fr="Retour à l’accueil" en="Back to home" /></Link>
      </div>

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_29rem] lg:gap-16">
        <section className="hidden lg:block">
          <div className="flex items-center gap-5">
            <KawaiiMascot theme="party" size={112} className="border-4 border-white shadow-xl" />
            <div>
              <p className="fp-eyebrow"><LocalizedText fr="Votre espace joueur" en="Your player space" /></p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-fp-text"><LocalizedText fr="Retrouvez vos parties partout." en="Take your games everywhere." /></h1>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-lg leading-8 text-fp-text-dim"><LocalizedText fr="Le compte est facultatif pour jouer. Il sert à conserver votre historique, synchroniser vos appareils et retrouver vos amis." en="An account is optional. It saves your history, syncs your devices and helps you find your friends." /></p>
          <ul className="mt-8 grid gap-4">
            <li className="flex items-start gap-3 rounded-2xl border border-fp-border bg-white/75 p-4"><History className="mt-0.5 h-5 w-5 shrink-0 text-fp-primary" /><div><p className="font-bold text-fp-text"><LocalizedText fr="Questions inédites" en="Fresh questions" /></p><p className="mt-0.5 text-sm text-fp-text-dim"><LocalizedText fr="Votre historique anti-répétition vous suit d’une partie à l’autre." en="Your anti-repeat history follows you from one game to the next." /></p></div></li>
            <li className="flex items-start gap-3 rounded-2xl border border-fp-border bg-white/75 p-4"><UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-fp-primary" /><div><p className="font-bold text-fp-text"><LocalizedText fr="Salons et amis" en="Rooms and friends" /></p><p className="mt-0.5 text-sm text-fp-text-dim"><LocalizedText fr="Reprenez plus facilement les parties avec votre groupe." en="Get back into games with your group more easily." /></p></div></li>
            <li className="flex items-start gap-3 rounded-2xl border border-fp-border bg-white/75 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fp-success" /><div><p className="font-bold text-fp-text"><LocalizedText fr="Session mémorisée" en="Stay signed in" /></p><p className="mt-0.5 text-sm text-fp-text-dim"><LocalizedText fr="Une fois connecté, vous n’avez pas à saisir vos identifiants à chaque visite." en="Once signed in, you won't need to enter your details on every visit." /></p></div></li>
          </ul>
          <Link href="/play/local" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-fp-primary hover:underline"><LocalizedText fr="Continuer sans compte" en="Continue without an account" /></Link>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-5 text-center lg:hidden">
            <KawaiiMascot theme="party" size={76} className="mb-3" />
            <h1 className="text-2xl font-black tracking-tight text-fp-text"><LocalizedText fr="Votre espace joueur" en="Your player space" /></h1>
            <p className="mt-1 text-sm text-fp-text-dim"><LocalizedText fr="Le compte reste facultatif pour jouer." en="You can still play without an account." /></p>
          </div>
          <AuthForm mode={initialMode} />
          <Link href="/play/local" className="mt-4 flex min-h-12 items-center justify-center rounded-xl text-sm font-bold text-fp-text-dim hover:bg-black/[0.04] hover:text-fp-text lg:hidden"><LocalizedText fr="Continuer sans compte" en="Continue without an account" /></Link>
        </section>
      </div>
    </main>
  );
}
