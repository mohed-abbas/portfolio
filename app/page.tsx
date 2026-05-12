import { Hero } from '@/components/sections/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { Projects } from '@/components/sections/Projects';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';

export default function Home() {
  return (
    <>
      <WelcomeScreen />
      <Hero />
      <Philosophy />
      <Projects />
    </>
  );
}
