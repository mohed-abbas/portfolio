"use client";

import Image from "next/image";
import styles from "./NextCase.module.css";

export function NextCase() {
  return (
    <nav className={styles.next} aria-label="Next case study">
      <a
        className={styles.link}
        href="#"
        aria-disabled="true"
        onClick={(e) => e.preventDefault()}
      >
        <div className={styles.left}>
          <span className={styles.eyebrow}>Next case · 02 / 02</span>
          <h2 className={styles.title}>
            PERMITTO<span className={styles.titleAccent}>.</span>
          </h2>
          <div className={styles.metaPills}>
            <span className={styles.pill}>2025</span>
            <span className={styles.pill}>Fintech</span>
            <span className={`${styles.pill} ${styles.pillSolid}`}>
              Read case →
            </span>
          </div>
        </div>
        <div className={styles.imageWrap}>
          <Image
            className={styles.image}
            src="/images/work/tasktrox/Product.jpg"
            alt="Permitto preview"
            width={2400}
            height={1500}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <span className={styles.badge} aria-hidden>
            Live
            <br />
            Demo
          </span>
        </div>
      </a>
    </nav>
  );
}
