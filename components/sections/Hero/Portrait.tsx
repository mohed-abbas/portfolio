import Image from 'next/image';
import styles from './Portrait.module.css';

export function Portrait() {
  return (
    <div className={styles.portrait}>
      <Image
        src="/images/hero/heroimg.png"
        alt="Mohed Abbas portrait"
        width={500}
        height={400}
        priority
        className={styles.portraitImage}
      />
    </div>
  );
}
