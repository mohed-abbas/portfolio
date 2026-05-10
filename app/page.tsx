import { Hero, InteractiveBackgroundV2 } from '@/components/sections/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { Projects } from '@/components/sections/Projects';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <>
      <InteractiveBackgroundV2 />
      <WelcomeScreen />
      <Navbar />
      <Hero />
      <Philosophy />
      <Projects />
    </>
  );
}
