import { ProfileClient } from '@/components/profile/profile-client';
export default async function ProfilePage({searchParams}:{searchParams:Promise<{character?:string}>}){const {character}=await searchParams;return <ProfileClient character={character}/>}
