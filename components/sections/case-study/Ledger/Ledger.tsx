import styles from "./Ledger.module.css";

type LedgerEntry = {
  label: string;
  value: string;
  descriptor: string;
};

const ENTRIES: readonly LedgerEntry[] = [
  { label: "Client", value: "Tasktrox", descriptor: "Internal venture" },
  { label: "Year", value: "2024", descriptor: "April → November" },
  { label: "Role", value: "Lead", descriptor: "Brand · Product · Web" },
  { label: "Stack", value: "Next · GSAP", descriptor: "Lenis · Tailwind" },
  { label: "Reach", value: "+38", descriptor: "Studios in private beta" },
] as const;

export function Ledger() {
  return (
    <section className={styles.ledger} aria-label="Project vitals">
      <dl className={styles.inner}>
        {ENTRIES.map((entry) => (
          <div key={entry.label} className={styles.cell}>
            <dt className={styles.label}>{entry.label}</dt>
            <dd className={styles.value}>
              {entry.value}
              <small className={styles.descriptor}>{entry.descriptor}</small>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
