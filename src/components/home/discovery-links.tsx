import Link from "next/link";
import { DISCOVERY_PACKS } from "@/lib/game/discovery";

export function DiscoveryLinks({ solo, online, count, en, search }: { solo: boolean; online: boolean; count: number; en: boolean; search: string }) {
  const language = en ? "en" : "fr";
  const packs = DISCOVERY_PACKS.filter(pack => `${pack.title[language]} ${pack.description[language]}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  if (!packs.length) return null;
  return <section className="mt-8 space-y-4"><h2 className="text-2xl font-bold">{en ? "Connection & well-being" : "Complicité & bien-être"}</h2><p>{en ? "Without pressure or rankings. Adult content is opt-in." : "Sans pression ni classement. Le contenu adulte reste facultatif."}</p><div className="jx-game-grid">{packs.map(pack => <Link key={pack.id} className="jx-form-card" href={`/play/discovery?pack=${pack.id}&players=${count}${solo ? "&solo=1" : online ? "&device=online" : ""}`}><h3 className="font-bold">{pack.title[language]}</h3><p>{pack.description[language]}</p><small>{solo ? (en ? "Solo" : "Solo") : online ? (en ? "Each on their device" : "Chacun sur son appareil") : (en ? "Shared phone" : "Téléphone partagé")}</small></Link>)}</div></section>;
}
