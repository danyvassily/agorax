import type { Metadata } from 'next';
import { AppNavigation } from '@/components/ui/app-navigation';
import { LocalGameSetupClient } from '@/components/home/local-game-setup-client';

export const metadata: Metadata = {
  title: 'Préparer un quiz — Agorax',
  description: 'Choisissez votre thème, un sous-thème et votre niveau pour lancer un quiz personnalisé.',
  alternates: { canonical: 'https://agorax.online/quiz' },
};

export default function QuizIndexPage() {
  return <><AppNavigation /><LocalGameSetupClient mode="classic" solo compact /></>;
}
