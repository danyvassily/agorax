"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, UsersRound, CircleDot, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { PlayerDot } from '@/components/ui/primitives';
import { useLanguageStore } from '@/lib/store/language';
const items=[{href:'/',fr:'Accueil',en:'Home',icon:House},{href:'/play/local',fr:'Ensemble',en:'Together',icon:UsersRound},{href:'/play/solo',fr:'Solo',en:'Solo',icon:CircleDot},{href:'/profile',fr:'Profil',en:'Profile',icon:UserRound}];
export function BrandMark({compact=false}:{compact?:boolean}) {return <Link href="/" className="jx-wordmark" aria-label="JOUXTA">{compact?'JX':'JOUXTA'}</Link>}
export function AppNavigation(){
 const path=usePathname(),en=useLanguageStore(s=>s.language)==='en';const {user}=useAuth();
 const active=(href:string)=>href==='/'?path==='/':href==='/profile'?path.startsWith('/profile')||path.startsWith('/auth')||path.startsWith('/settings'):href==='/play/solo'?path.startsWith(href)||path.startsWith('/quiz')||path.startsWith('/daily'):path.startsWith('/play/local')||path.startsWith('/play/online');
 const links=items.map(({href,fr,en:english,icon:Icon})=><Link key={href} href={href} aria-current={active(href)?'page':undefined} className={active(href)?'is-active':''}><Icon size={21}/><span>{en?english:fr}</span></Link>);
 return <><header className="jx-header"><div><BrandMark/><nav aria-label={en?'Main navigation':'Navigation principale'} className="jx-desktop-nav">{links}</nav><Link href="/profile" aria-label={en?'My profile':'Mon profil'} className="jx-profile-link"><PlayerDot name={user?.name??'J'} avatarUrl={user?.avatarUrl??'/images/team/milo.png'} size={40}/></Link></div></header><nav className="jx-mobile-nav" aria-label={en?'Mobile navigation':'Navigation mobile'}>{links}</nav></>;
}
