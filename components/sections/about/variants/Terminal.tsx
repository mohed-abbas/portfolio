'use client';

/* ABOUT · Terminal / Dev-native
   The bio as a typed TS object in a themed editor pane: line-numbered gutter,
   syntax highlighting from the brand palette, a JSDoc lede and a blinking
   caret. Lines reveal top-to-bottom with a CSS stagger (reduced-motion shows
   the final state). Composed from existing content — no invented facts.

   The code is modelled as tokens (class + text) rather than JSX so the gutter,
   highlighting, and reveal stagger all line up from one source. */

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content, navigation } from '@/data';
import styles from './Terminal.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');
const focus = content.skills.marqueeItems.map((s) => s.toLowerCase());

// Lede split into short JSDoc comment lines so it reads as code.
const ledeComment = content.about.lede.match(/.{1,46}(\s|$)/g)?.map((s) => s.trim()) ?? [
  content.about.lede,
];

type Token = { cls: string; v: string };
const tk = (cls: string, v: string): Token => ({ cls, v });
const sp = (v: string) => tk('', v); // plain text / indentation

const focusTokens: Token[] = focus.flatMap((f, i) =>
  i < focus.length - 1
    ? [tk(styles.str, `"${f}"`), tk(styles.op, ', ')]
    : [tk(styles.str, `"${f}"`)],
);

const lines: Token[][] = [
  [tk(styles.comment, '/**')],
  ...ledeComment.map((c) => [tk(styles.comment, ` * ${c}`)]),
  [tk(styles.comment, ' */')],
  [tk(styles.kw, 'const'), sp(' '), tk(styles.var, 'mohed'), sp(' '), tk(styles.op, '='), sp(' '), tk(styles.op, '{')],
  [sp('  '), tk(styles.key, 'role'), tk(styles.op, ':'), sp(' '), tk(styles.str, '"Full Stack Web Engineer"'), tk(styles.op, ',')],
  [sp('  '), tk(styles.key, 'building'), tk(styles.op, ':'), sp(' '), tk(styles.str, '"TASKTROX"'), tk(styles.op, ',')],
  [sp('  '), tk(styles.key, 'focus'), tk(styles.op, ':'), sp(' '), tk(styles.op, '['), ...focusTokens, tk(styles.op, ']'), tk(styles.op, ',')],
  [sp('  '), tk(styles.key, 'basedIn'), tk(styles.op, ':'), sp(' '), tk(styles.str, `"${basedIn}"`), tk(styles.op, ',')],
  [sp('  '), tk(styles.key, 'independent'), tk(styles.op, ':'), sp(' '), tk(styles.bool, 'true'), tk(styles.op, ',')],
  [tk(styles.op, '}'), tk(styles.op, ';')],
];

export function AboutTerminal() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.metaLabel}>
          <StarIcon variant="outline" baseClassName={styles.starIcon} />
          {content.about.label}
        </div>

        <div className={styles.editor} role="img" aria-label={`About: ${content.about.lede}`}>
          <div className={styles.chrome}>
            <span className={styles.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className={styles.filename}>about.ts</span>
            <span className={styles.branch} aria-hidden="true">
              main
            </span>
          </div>
          <pre className={styles.code} aria-hidden="true">
            {lines.map((toks, i) => (
              <span key={i} className={styles.line} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.gutter}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.lineText}>
                  {toks.map((t, j) => (
                    <span key={j} className={t.cls || undefined}>
                      {t.v}
                    </span>
                  ))}
                  {i === lines.length - 1 && <span className={styles.caret} aria-hidden="true" />}
                </span>
              </span>
            ))}
          </pre>
        </div>
      </div>
    </section>
  );
}
