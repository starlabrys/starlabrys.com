import type { Locale } from "@/lib/i18n";

const COPY: Record<
  Locale,
  { title: string; body: string; emailLabel: string }
> = {
  zh: {
    title: "联系我们",
    body: "如果你有软件开发或技术咨询方面的合作需求，欢迎通过以下方式联系。",
    emailLabel: "邮箱",
  },
  en: {
    title: "Contact",
    body: "For software development or technical consulting inquiries, feel free to reach out.",
    emailLabel: "Email",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  const copy = COPY[locale];

  return (
    <div>
      <h1 className="text-3xl font-bold">{copy.title}</h1>
      <p className="mt-4 text-text-secondary">{copy.body}</p>
      <dl className="mt-8 space-y-4">
        <div>
          <dt className="text-sm text-text-secondary">{copy.emailLabel}</dt>
          <dd>
            <a
              href="mailto:wiloon.wy@gmail.com"
              className="text-accent-start hover:underline"
            >
              wiloon.wy@gmail.com
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-secondary">GitHub</dt>
          <dd>
            <a
              href="https://github.com/wiloon"
              className="text-accent-start hover:underline"
            >
              github.com/wiloon
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
