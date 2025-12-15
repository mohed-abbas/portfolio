import styles from './SkillsBar.module.css';

const skills = [
  'INTERACTIVE',
  'UI/UX',
  'BRAND STRATEGY',
  'UI/UX',
  'INTERACTIVE',
  'BRAND STRATEGY',
  'UI/UX',
];

export function SkillsBar() {
  return (
    <div className={styles.skillsBar}>
      <div className={styles.skillsBarInner}>
        <div className={styles.skillsWrapper}>
          <div className={styles.skillsContent}>
            {skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {skills.map((skill, index) => (
              <span key={`dup-${index}`}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
