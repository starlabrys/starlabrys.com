import type { Locale } from "@/lib/i18n";

const COPY: Record<Locale, { rights: string }> = {
  zh: { rights: "星钺（大连）科技有限公司" },
  en: { rights: "Xingyue (Dalian) Technology Co., Ltd." },
};

export default function Footer({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <footer className="mt-auto">
      <hr className="divider" />
      <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-text-secondary">
        <p>
          &copy; {new Date().getFullYear()} Starlabrys · {copy.rights}
        </p>
        <p className="mt-2">
          <a href="mailto:wiloon.wy@gmail.com" className="hover:text-foreground">
            wiloon.wy@gmail.com
          </a>
          {" · "}
          <a
            href="https://github.com/wiloon"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
