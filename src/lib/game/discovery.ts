import { z } from "zod";

export type DiscoveryLanguage = "fr" | "en";
type Text = Record<DiscoveryLanguage, string>;
const t = (fr: string, en: string): Text => ({ fr, en });
export interface DiscoveryCard { id: string; text: Text; reveal?: Text }
export interface DiscoveryPack { id: string; title: Text; description: Text; adult?: boolean; cards: DiscoveryCard[] }
function cards(prefix: string, rows: [string, string, string?, string?][]): DiscoveryCard[] {
  return rows.map(([fr, en, answerFr, answerEn], i) => ({ id: `${prefix}-${i + 1}`, text: t(fr, en), ...(answerFr && answerEn ? { reveal: t(answerFr, answerEn) } : {}) }));
}

// Original discussion prompts. These are not clinical instruments or diagnostic tests.
export const DISCOVERY_PACKS: DiscoveryPack[] = [
  { id: "couple-light", title: t("Couple · Complicité", "Couples · Connection"), description: t("Souvenirs, petites attentions et projets à deux.", "Memories, small gestures and plans together."), cards: cards("connection", [
    ["Quelle petite attention te fait te sentir apprécié·e ?", "What small gesture makes you feel appreciated?"],
    ["Quel souvenir aimerais-tu créer à deux cette année ?", "What memory would you like to create together this year?"],
    ["À quoi ressemble ta soirée idéale sans écran ?", "What does your ideal screen-free evening look like?"],
    ["Quelle qualité admires-tu chez un partenaire ?", "What quality do you admire in a partner?"],
    ["Quel rituel simple aimerais-tu inventer à deux ?", "What simple ritual would you like to create together?"],
    ["Quelle aventure à petit budget te ferait plaisir ?", "What low-budget adventure would make you happy?"],
  ]) },
  { id: "couple-deep", title: t("Couple · Vraies discussions", "Couples · Deeper conversations"), description: t("Besoins, limites et écoute, sans chercher un gagnant.", "Needs, boundaries and listening, without a winner."), cards: cards("deep", [
    ["Quand tu es contrarié·e, préfères-tu être écouté·e ou chercher des solutions ?", "When you are upset, would you rather be heard or look for solutions?"],
    ["Comment pourrais-tu demander une pause dans une discussion tendue ?", "How could you ask for a break in a tense conversation?"],
    ["Quel équilibre entre moments seuls et moments ensemble te convient ?", "What balance of alone time and time together suits you?"],
    ["Quel besoin aimerais-tu exprimer avec une phrase commençant par « j’aimerais » ?", "What need could you express with a sentence beginning with ‘I would like’?"],
    ["Quelle limite personnelle souhaites-tu voir respectée, sans devoir la justifier ?", "What personal boundary would you like respected without having to justify it?"],
    ["Écoutez une minute sans interrompre, puis demandez : « Est-ce que j’ai bien compris ? » En solo, prépare une demande que tu souhaites formuler.", "Listen for a minute without interrupting, then ask: ‘Did I understand correctly?’ Solo, prepare a request you would like to make."],
  ]) },
  { id: "couple-adult", adult: true, title: t("Couple · Intimité 18+", "Couples · Intimacy 18+"), description: t("Désirs et consentement entre adultes volontaires. Aucun défi imposé.", "Desires and consent between willing adults. No compulsory dares."), cards: cards("intimacy", [
    ["Qu’est-ce qui te permet de parler de tes envies sans pression ?", "What helps you talk about your desires without pressure?"],
    ["Comment aimerais-tu qu’on vérifie ton envie de continuer un moment intime ?", "How would you like someone to check whether you want to continue an intimate moment?"],
    ["Quelle ambiance te met à l’aise pour un moment de tendresse ?", "What atmosphere makes you comfortable with a moment of affection?"],
    ["Comment aimerais-tu dire « pas maintenant » et être accueilli·e avec respect ?", "How would you like to say ‘not now’ and be met with respect?"],
    ["Quelles attentions apprécies-tu après un moment intime ?", "What gestures do you appreciate after an intimate moment?"],
    ["De quoi aimerais-tu discuter avant d’explorer quelque chose de nouveau, sans obligation de le faire ?", "What would you like to discuss before exploring something new, with no obligation to do it?"],
  ]) },
  { id: "wellbeing-checkin", title: t("Bien-être · Faire le point", "Well-being · Check-in"), description: t("Questions de réflexion, sans diagnostic ni note.", "Reflection questions, without diagnosis or a score."), cards: cards("checkin", [
    ["Quel mot décrit ton état du moment ? Tu peux le garder pour toi.", "What word describes how you feel right now? You can keep it to yourself."],
    ["Qu’est-ce qui t’a demandé de l’énergie aujourd’hui ?", "What took energy from you today?"],
    ["Qu’est-ce qui t’a offert un petit moment de répit ?", "What gave you a small moment of relief?"],
    ["De quelle aide concrète aurais-tu envie cette semaine ?", "What practical help would you welcome this week?"],
    ["Quelle attente pourrais-tu alléger aujourd’hui ?", "What expectation could you ease today?"],
    ["Vers quelle personne de confiance pourrais-tu te tourner si tu en ressens le besoin ?", "Who is a trusted person you could turn to if you feel the need?"],
  ]) },
  { id: "wellbeing-practice", title: t("Bien-être · Petite pause", "Well-being · Small pause"), description: t("Exercices facultatifs, à adapter à ton confort.", "Optional exercises to adapt to your comfort."), cards: cards("practice", [
    ["Si c’est confortable, regarde autour de toi et remarque trois couleurs. Tu peux simplement observer, sans rien raconter.", "If comfortable, look around and notice three colours. You can just observe without sharing anything."],
    ["Choisis une toute petite action réalisable aujourd’hui qui compte pour toi. Rien à prouver au groupe.", "Choose one tiny action you can take today that matters to you. There is nothing to prove to the group."],
    ["Imagine ce que tu dirais avec gentillesse à un ami qui traverse une journée difficile. Adresse-toi ces mêmes mots si tu le souhaites.", "Imagine what you would kindly say to a friend having a hard day. Offer yourself those words if you wish."],
    ["Repère un objet près de toi. Observe tranquillement sa forme et sa texture, sans obligation de le toucher.", "Find an object nearby. Gently notice its shape and texture without needing to touch it."],
    ["Prépare une demande d’aide courte : « Est-ce que tu pourrais… ? » Tu n’as pas besoin de l’envoyer maintenant.", "Prepare a short request for help: ‘Could you…?’ You do not have to send it now."],
    ["Choisis une pause qui te convient : regarder dehors, t’étirer si possible ou rester assis·e tranquillement. Arrête si cela te gêne.", "Choose a break that suits you: look outside, stretch if possible or sit quietly. Stop if it feels uncomfortable."],
  ]) },
  { id: "astro-quiz", title: t("Astro · Quiz des traditions", "Astro · Traditions quiz"), description: t("Culture astrologique, pas de prédiction scientifique.", "Astrological culture, not scientific predictions."), cards: cards("astroquiz", [
    ["Dans le zodiaque occidental traditionnel, quel animal représente le Bélier ?", "In the traditional Western zodiac, which animal represents Aries?", "Un bélier.", "A ram."],
    ["Quel signe occidental est représenté par des jumeaux ?", "Which Western zodiac sign is represented by twins?", "Les Gémeaux.", "Gemini."],
    ["Quel signe occidental est représenté par une balance ?", "Which Western zodiac sign is represented by scales?", "La Balance.", "Libra."],
    ["Combien de signes compte le zodiaque occidental traditionnel ?", "How many signs are in the traditional Western zodiac?", "Douze. Il s’agit d’un système traditionnel, distinct des constellations astronomiques.", "Twelve. This is a traditional system, distinct from astronomical constellations."],
    ["Le Lion est représenté par quel animal ?", "Which animal represents Leo?", "Un lion.", "A lion."],
    ["Les Poissons sont représentés par quels animaux ?", "Which animals represent Pisces?", "Des poissons.", "Fish."],
  ]) },
  { id: "astro-play", title: t("Astro · Portraits imaginaires", "Astro · Imaginary portraits"), description: t("Inventez votre duo cosmique, juste pour le plaisir.", "Invent your cosmic duo, just for fun."), cards: cards("astroplay", [
    ["Choisis ton énergie imaginaire du jour : feu créatif, terre tranquille, air curieux ou eau rêveuse. Pourquoi ce choix aujourd’hui ?", "Choose your imaginary energy today: creative fire, calm earth, curious air or dreamy water. Why this choice today?"],
    ["Invente un nom de constellation qui représente une de tes qualités.", "Invent a constellation name that represents one of your strengths."],
    ["Quel serait ton superpouvoir cosmique pour aider un ami ?", "What would your cosmic superpower be for helping a friend?"],
    ["À deux, inventez une mission spatiale où vos qualités se complètent. En solo, imagine le partenaire idéal pour cette mission.", "Together, invent a space mission where your strengths complement each other. Solo, imagine your ideal partner for this mission."],
    ["Ton duo imaginaire préfère-t-il explorer une planète ou construire un refuge ? Discutez sans chercher de compatibilité chiffrée.", "Would your imaginary duo rather explore a planet or build a refuge? Discuss without seeking a compatibility score."],
    ["Donne un titre à ton portrait cosmique du jour et une intention pour demain. Ce jeu ne prédit ni ton caractère ni ton avenir.", "Give today's cosmic portrait a title and an intention for tomorrow. This game predicts neither personality nor the future."],
  ]) },
];

export const discoveryStateSchema = z.object({
  packId: z.string().refine(id => DISCOVERY_PACKS.some(p => p.id === id)),
  deck: z.array(z.string()).min(1).max(50),
  roundId: z.string().min(1),
}).superRefine((state, ctx) => {
  const pack = DISCOVERY_PACKS.find(p => p.id === state.packId);
  if (!pack) return;
  if (new Set(state.deck).size !== state.deck.length || state.deck.some(id => !pack.cards.some(c => c.id === id))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid discovery deck" });
  }
});
export type DiscoveryState = z.infer<typeof discoveryStateSchema>;

/** Never silently recycle cards. The caller explicitly offers a replay on exhaustion. */
export function discoveryDeck(packId: string, seen: readonly string[] = [], random = Math.random): string[] {
  const ids = DISCOVERY_PACKS.find(p => p.id === packId)?.cards.filter(c => !seen.includes(c.id)).map(c => c.id) ?? [];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
