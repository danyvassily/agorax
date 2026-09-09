"use client";
import { useRouter } from 'next/navigation';
import { GameSetup } from '@/components/home/game-setup';
import { useGameStore, type GameMode } from '@/lib/store/game';
import type { QuestionCategory } from '@/lib/questions/schema';

export function LocalGameSetupClient({
  mode,
  solo = false,
  initialCount,
  initialCategory,
  initialSubcategory,
}: {
  mode: GameMode;
  solo?: boolean;
  initialCount?: number;
  initialCategory?: QuestionCategory | 'mixed';
  initialSubcategory?: string;
}) {
  const router = useRouter();
  const setConfig = useGameStore(s => s.setConfig);
  return (
    <main className="jx-page jx-setup-page">
      <GameSetup
        mode={mode}
        solo={solo}
        initialCount={initialCount}
        initialCategory={initialCategory}
        initialSubcategory={initialSubcategory}
        onBack={() => router.push(solo ? '/play/solo' : '/play/local')}
        onLaunch={config => {
          setConfig(config);
          router.push('/play');
        }}
      />
    </main>
  );
}
