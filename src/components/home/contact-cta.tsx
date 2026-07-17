import Reveal from "./reveal";
import { btnGhostDark, btnPrimary, sectionHeadTitle, shell } from "./ui";
import type { HomeContent } from "@/lib/home-content";

export default function ContactCta({
  contact,
}: {
  contact: HomeContent["contact"];
}) {
  return (
    <section id="contact" className="bg-home-teal-soft py-[5.5rem]">
      <Reveal className={`${shell} max-w-[48rem] text-center`}>
        <h2 className={`${sectionHeadTitle} text-home-ink`}>
          {contact.title}
        </h2>
        <p className="mx-auto mt-4 text-[1.05rem] text-home-slate sm:text-nowrap">
          {contact.body}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${contact.email}`} className={btnPrimary}>
            {contact.ctaEmail}
          </a>
          <a href="#services" className={btnGhostDark}>
            {contact.ctaExplore}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
