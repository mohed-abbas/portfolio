'use client';

/* ABOUT · IDE workspace
   The Terminal variant grown into a multi-file editor. A tab strip exposes four
   "files" (profile.ts / experience.json / certs.md / education.yml); clicking a
   tab swaps the syntax-highlighted pane in place, so all three CV blocks live in
   one screen. Each file is modelled as token lines so the gutter, highlighting
   and reveal stagger line up from one source.

   Built from content.about; placeholder CV entries get a trailing // sample. */

import { useState } from 'react';
import { content, navigation } from '@/data';
import styles from './IDE.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');
const { lede, experience, certifications, education } = content.about;
const { title } = content.hero;

type Token = { cls: string; v: string };
const tk = (cls: string, v: string): Token => ({ cls, v });
const sp = (v: string) => tk('', v);
const SAMPLE = tk('comment', '   // sample');

// ── profile.ts ──
const ledeComment = lede.match(/.{1,52}(\s|$)/g)?.map((s) => s.trim()) ?? [lede];
const profileLines: Token[][] = [
  [tk('comment', '/**')],
  ...ledeComment.map((c) => [tk('comment', ` * ${c}`)]),
  [tk('comment', ' */')],
  [tk('kw', 'export const'), sp(' '), tk('var', 'mohed'), sp(' '), tk('op', '='), sp(' '), tk('op', '{')],
  [sp('  '), tk('key', 'role'), tk('op', ':'), sp(' '), tk('str', `"${title}"`), tk('op', ',')],
  [sp('  '), tk('key', 'status'), tk('op', ':'), sp(' '), tk('str', '"Independent"'), tk('op', ',')],
  [sp('  '), tk('key', 'building'), tk('op', ':'), sp(' '), tk('str', '"TASKTROX"'), tk('op', ',')],
  [sp('  '), tk('key', 'basedIn'), tk('op', ':'), sp(' '), tk('str', `"${basedIn}"`), tk('op', ',')],
  [tk('op', '}'), tk('op', ';')],
];

// ── experience.json ──
const experienceLines: Token[][] = [
  [tk('op', '[')],
  ...experience.flatMap((e, i) => {
    const comma = i < experience.length - 1 ? ',' : '';
    return [
      [sp('  '), tk('op', '{'), ...(e.placeholder ? [SAMPLE] : [])],
      [sp('    '), tk('key', '"role"'), tk('op', ': '), tk('str', `"${e.role}"`), tk('op', ',')],
      [sp('    '), tk('key', '"org"'), tk('op', ': '), tk('str', `"${e.org}"`), tk('op', ',')],
      [sp('    '), tk('key', '"period"'), tk('op', ': '), tk('str', `"${e.period}"`), tk('op', ',')],
      [
        sp('    '),
        tk('key', '"stack"'),
        tk('op', ': ['),
        ...(e.tags ?? []).flatMap((t, j, arr) =>
          j < arr.length - 1 ? [tk('str', `"${t}"`), tk('op', ', ')] : [tk('str', `"${t}"`)],
        ),
        tk('op', ']'),
      ],
      [sp('  '), tk('op', `}${comma}`)],
    ];
  }),
  [tk('op', ']')],
];

// ── certs.md ──
const certLines: Token[][] = [
  [tk('kw', '# '), tk('var', 'Certifications')],
  [sp('')],
  ...certifications.map((c) => [
    tk('op', '- '),
    tk('mdBold', `**${c.name}**`),
    tk('op', ' — '),
    sp(`${c.issuer} `),
    tk('num', `(${c.year})`),
    ...(c.placeholder ? [SAMPLE] : []),
  ]),
];

// ── education.yml ──
const eduLines: Token[][] = [
  [tk('key', 'education'), tk('op', ':')],
  ...education.flatMap((e) => [
    [sp('  '), tk('op', '- '), tk('key', 'credential'), tk('op', ': '), tk('str', e.credential), ...(e.placeholder ? [SAMPLE] : [])],
    [sp('    '), tk('key', 'institution'), tk('op', ': '), tk('str', e.institution)],
    [sp('    '), tk('key', 'period'), tk('op', ': '), tk('num', e.period)],
    ...(e.detail ? [[sp('    '), tk('key', 'note'), tk('op', ': '), tk('str', e.detail)]] : []),
  ]),
];

type FileKey = 'profile' | 'experience' | 'certs' | 'education';
const FILES: { key: FileKey; name: string; lines: Token[][] }[] = [
  { key: 'profile', name: 'profile.ts', lines: profileLines },
  { key: 'experience', name: 'experience.json', lines: experienceLines },
  { key: 'certs', name: 'certs.md', lines: certLines },
  { key: 'education', name: 'education.yml', lines: eduLines },
];

export function AboutIDE() {
  const [active, setActive] = useState<FileKey>('profile');
  const file = FILES.find((f) => f.key === active) ?? FILES[0];

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.metaLabel}>
          <span className={styles.dot} aria-hidden="true" />
          {content.about.label} · workspace
        </div>

        <div className={styles.editor}>
          <div className={styles.tabBar} role="tablist" aria-label="About files">
            {FILES.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active === f.key}
                className={`${styles.tab} ${active === f.key ? styles.tabActive : ''}`}
                onClick={() => setActive(f.key)}
              >
                <span className={styles.tabDot} aria-hidden="true" />
                {f.name}
              </button>
            ))}
          </div>

          <pre className={styles.code} key={active} aria-label={`${file.name} contents`}>
            {file.lines.map((toks, i) => (
              <span key={i} className={styles.line} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.gutter}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.lineText}>
                  {toks.map((t, j) => (
                    <span key={j} className={t.cls ? styles[t.cls] : undefined}>
                      {t.v}
                    </span>
                  ))}
                  {i === file.lines.length - 1 && <span className={styles.caret} aria-hidden="true" />}
                </span>
              </span>
            ))}
          </pre>

          <div className={styles.statusBar} aria-hidden="true">
            <span>{file.name}</span>
            <span className={styles.statusRight}>
              {file.lines.length} lines · UTF-8 · main
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
