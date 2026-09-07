export const CHARACTERS = [
  { id: 'milo', name: 'Milo', role: 'Le capitaine', roleEn: 'The captain', color: '#ffe5ce' },
  { id: 'ziggy', name: 'Ziggy', role: 'L’étincelle', roleEn: 'The spark', color: '#ddf8f4' },
  { id: 'luma', name: 'Luma', role: 'La tête chercheuse', roleEn: 'The curious mind', color: '#eee6fa' },
  { id: 'poppy', name: 'Poppy', role: 'Le lien du groupe', roleEn: 'The connector', color: '#ffe3df' },
  { id: 'neo', name: 'Neo', role: 'La force tranquille', roleEn: 'The quiet strength', color: '#e1f3e9' },
] as const;
export type CharacterId = typeof CHARACTERS[number]['id'];
export const characterImage = (id: string) => `/images/team/${id}.png`;
