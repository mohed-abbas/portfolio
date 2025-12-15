import { Navbar } from '@/components/layout/Navbar';
import { BackgroundGrid } from './BackgroundGrid';
import { HeroText } from './HeroText';
import { Portrait } from './Portrait';
import { SkillsBar } from './SkillsBar';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <main className={styles.hero}>
      {/* Background Grid with Plus Signs */}
      <BackgroundGrid />

      {/* Navbar */}
      <Navbar />

      {/* Text and Arm Section */}
      <HeroText />

      {/* Portrait Section */}
      <Portrait />

      {/* Skills Bar (Diagonal) */}
      <SkillsBar />
    </main>
  );
}
