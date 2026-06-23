/* ABOUT PAGE · composition
   The dedicated /about page, built like a case study: the Echo hero masthead,
   the reused case-study Ledger as a vitals strip, an Intro reading column,
   a numbered Experience list, a Current Project spotlight (TASKTROX), a GitHub
   contribution snake, Credentials (certs ledger + education), and the shared
   home-page Contact form as the closing CTA.
   Editorial is the base language; the Ledger is woven in at the top as vitals. */

import { Ledger } from "@/components/sections/case-study/Ledger";
import { Contact } from "@/components/sections/Contact";
import { AboutPageHeroEcho } from "./Echo";
import { AboutPageIntro } from "./Intro";
import { AboutPageExperience } from "./Experience";
import { AboutPageCurrentProject } from "./CurrentProject";
import { AboutPageContributions } from "./Contributions";
import { AboutPageCredentials } from "./Credentials";

const VITALS = [
  { label: "Status", primary: "Full time", secondary: "Builds independently" },
  { label: "Discipline", primary: "Full Stack", secondary: "Interface to infrastructure" },
  { label: "Building", primary: "TASKTROX", secondary: "Internal ops platform" },
  { label: "Based in", primary: "Europe", secondary: "Working worldwide" },
  { label: "Ships", primary: "Real things", secondary: "Not mockups" },
];

export function AboutPageView() {
  return (
    <main>
      <AboutPageHeroEcho />
      <Ledger entries={VITALS} />
      <AboutPageIntro />
      <AboutPageExperience />
      <AboutPageCurrentProject />
      <AboutPageContributions />
      <AboutPageCredentials />
      <Contact />
    </main>
  );
}
