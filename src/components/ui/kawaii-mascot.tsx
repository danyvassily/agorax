"use client";
import Image from 'next/image';
import { CHARACTERS, characterImage } from '@/lib/characters';
export type KawaiiTheme = string;
const themes: Record<string, string> = {
  quiz:'luma', 'quiz-brain':'luma', thinking:'luma', conference:'luma',
  debate:'poppy', 'debate-chat':'poppy', waiting:'poppy', 'waiting-phone':'poppy', referee:'poppy',
  speed:'ziggy', 'speed-buzzer':'ziggy', 'buzzer-energy':'ziggy',
  party:'milo', 'party-trophy':'milo', 'party-dance':'milo', happy:'milo', sad:'neo', sweating:'neo', solo:'neo',
};
export function KawaiiMascot({theme,size=72,className='',alt,animation='none',eager=false}:{theme:KawaiiTheme;size?:number;className?:string;alt?:string;animation?:'float'|'wobble'|'bounce'|'dance'|'celebrate'|'shake'|'pop'|'none';eager?:boolean}) {
  const character=CHARACTERS.find(c=>c.id===(themes[theme]??theme))??CHARACTERS[0];
  return <span className={`jx-mascot ${animation==='celebrate'?'jx-celebrate':''} ${className}`} style={{width:size,height:size}}><Image src={characterImage(character.id)} width={size} height={size} alt={alt??character.name} loading={eager?'eager':'lazy'} className="h-full w-full object-contain" /></span>;
}
