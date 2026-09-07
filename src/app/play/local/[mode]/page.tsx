import { notFound } from 'next/navigation';
import { LocalGameSetupClient } from '@/components/home/local-game-setup-client';
import { MODE_META } from '@/lib/game/modes';
import type { GameMode } from '@/lib/store/game';
export default async function LocalGameSetupPage({params,searchParams}:{params:Promise<{mode:string}>;searchParams:Promise<{solo?:string;players?:string}>}){
 const {mode}=await params;const query=await searchParams;
 if(!Object.hasOwn(MODE_META,mode))notFound();
 const count=Number(query.players);
 return <LocalGameSetupClient mode={mode as GameMode} solo={query.solo==='1'&&MODE_META[mode as GameMode].minPlayers===1} initialCount={Number.isInteger(count)&&count>=2&&count<=8?count:undefined}/>;
}
