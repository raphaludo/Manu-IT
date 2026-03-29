export const siteConfig = {
  name: "Manual ITCD — Pará",
  shortName: "Manual ITCD PA",
  description:
    "Manual de orientação sobre o Imposto sobre Transmissão Causa Mortis e Doação de Quaisquer Bens ou Direitos (ITCD) no Estado do Pará.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://manual-itcd-pa.vercel.app",
  locale: "pt_BR",
  organization: {
    name: "Manual ITCD Pará",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://manual-itcd-pa.vercel.app",
  },
  links: {},
} as const;

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "pt_BR",
  siteName: siteConfig.name,
};
