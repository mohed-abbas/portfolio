import { Hero, InteractiveBackground } from '@/components/sections/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { Projects } from '@/components/sections/Projects';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';

export default function Home() {
  return (
    <>
      <InteractiveBackground />
      <WelcomeScreen />
      <Hero />
      <Philosophy />
      <Projects />
    </>
  );
}
