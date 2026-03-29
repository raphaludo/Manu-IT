/**
 * URL canônica do site (metadata, OG, sitemap).
 * Na Vercel: defina NEXT_PUBLIC_SITE_URL com https:// (ex.: https://manu-it.vercel.app).
 * Se não definir, usamos VERCEL_URL (injetada pela Vercel em build/preview).
 */
function normalizeAbsoluteUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }
  return `https://${trimmed.replace(/\/$/, "")}`;
}

export function getSiteUrl(): string {
  const explicit = normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit;

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "https://manual-itcd-pa.vercel.app";
}

const siteUrl = getSiteUrl();

export const siteConfig = {
  name: "Manual ITCD — Pará",
  shortName: "Manual ITCD PA",
  description:
    "Manual de orientação sobre o Imposto sobre Transmissão Causa Mortis e Doação de Quaisquer Bens ou Direitos (ITCD) no Estado do Pará.",
  url: siteUrl,
  locale: "pt_BR",
  organization: {
    name: "Manual ITCD Pará",
    url: siteUrl,
  },
  links: {},
} as const;

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "pt_BR",
  siteName: siteConfig.name,
};
