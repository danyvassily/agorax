export const CHARACTERS = [
  { id: 'milo', name: 'Milo', role: 'Le capitaine', roleEn: 'The captain', color: '#ffe5ce' },
  { id: 'ziggy', name: 'Ziggy', role: 'L’étincelle', roleEn: 'The spark', color: '#ddf8f4' },
  { id: 'luma', name: 'Luma', role: 'La tête chercheuse', roleEn: 'The curious mind', color: '#eee6fa' },
  { id: 'poppy', name: 'Poppy', role: 'Le lien du groupe', roleEn: 'The connector', color: '#ffe3df' },
  { id: 'neo', name: 'Neo', role: 'La force tranquille', roleEn: 'The quiet strength', color: '#e1f3e9' },
  { id: 'barnaby', name: 'Barnaby', role: 'L’enquêteur', roleEn: 'The detective', color: '#f3e8ff' },
  { id: 'toby', name: 'Toby', role: 'Le gardien du temps', roleEn: 'The timekeeper', color: '#e6f4ea' },
  { id: 'leo', name: 'Leo', role: 'L’animateur', roleEn: 'The host', color: '#fef7e0' },
  { id: 'koa', name: 'Koa', role: 'Le capitaine d’équipe', roleEn: 'The team captain', color: '#fce8e6' },
  { id: 'sora', name: 'Sora', role: 'L’intuitif', roleEn: 'The intuitive', color: '#edf2ff' },
] as const;
export type CharacterId = typeof CHARACTERS[number]['id'];
export const characterImage = (id: string) => `/images/team/${id}.png`;

