import { Navbar } from '@/components/layout/Navbar';
import { InteractiveBackground } from './InteractiveBackground';
import { HeroText } from './HeroText';
import { SkillsBar } from './SkillsBar';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <main className={styles.hero}>
      {/* Interactive Background with Hover Micro-interactions */}
      <InteractiveBackground />

      {/* Navbar */}
      <Navbar />

      {/* Text and Arm Section */}
      <HeroText />

      {/* Portrait Section */}
      {/* <Portrait /> */}

      {/* Skills Bar (Diagonal) */}
      <SkillsBar />
    </main>
  );
}
