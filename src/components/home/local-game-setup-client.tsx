"use client";
import { useRouter } from 'next/navigation';
import { GameSetup } from '@/components/home/game-setup';
import { useGameStore, type GameMode } from '@/lib/store/game';
export function LocalGameSetupClient({mode,solo=false,initialCount}:{mode:GameMode;solo?:boolean;initialCount?:number}){
 const router=useRouter();const setConfig=useGameStore(s=>s.setConfig);
 return <main className="jx-page jx-setup-page"><GameSetup mode={mode} solo={solo} initialCount={initialCount} onBack={()=>router.push(solo?'/play/solo':'/play/local')} onLaunch={config=>{setConfig(config);router.push('/play')}}/></main>;
}
