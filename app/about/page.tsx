import type { Metadata } from 'next';
import { AboutHero } from '@/components/sections/about/Hero';

const description =
  'Mohed Abbas builds web products end to end, from the interface to the containers it runs in.';

export const metadata: Metadata = {
  title: 'About · Mohed Abbas',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About · Mohed Abbas',
    description,
  },
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
    </main>
  );
}
