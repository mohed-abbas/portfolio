import type { Metadata } from "next";
import { Hero } from "@/components/sections/case-study/Hero";

export const metadata: Metadata = {
  title: "Tasktrox — Case Study · Mohed Abbas",
  description:
    "A complete identity and product redesign for a project-management platform built for architecture studios.",
};

export default function TasktroxCaseStudy() {
  return (
    <main>
      <Hero />
      {/* Placeholder for the next section — exists so the hero has real
          content to unpin against. Replace with the actual Overview /
          Context section when implemented. */}
      <section
        aria-label="Placeholder — overview"
        style={{
          minHeight: "200vh",
          background: "var(--color-primary-text)",
          color: "var(--color-background)",
          display: "grid",
          placeItems: "center",
          padding: "clamp(48px, 8vh, 120px)",
          fontFamily: "var(--font-primary)",
          fontSize: "clamp(20px, 2vw, 28px)",
          letterSpacing: "-0.01em",
        }}
      >
        Next section placeholder — scroll past the hero to land here.
      </section>
    </main>
  );
}
