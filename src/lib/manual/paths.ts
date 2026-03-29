import path from "path";

export const CONTENT_MANUAL_ROOT = path.join(process.cwd(), "content", "manual");

export function mdxPathFromSlug(slug: string[]): string {
  return path.join(CONTENT_MANUAL_ROOT, ...slug) + ".mdx";
}

/** `/manual/leis/arquivo` -> `['leis', 'arquivo']` */
export function slugFromManualPath(manualPath: string): string[] {
  const clean = manualPath.replace(/^\/manual\/?/, "").replace(/\/$/, "");
  if (!clean) return [];
  return clean.split("/").filter(Boolean);
}

export function manualHrefFromSlug(slug: string[]): string {
  return "/manual/" + slug.join("/");
}
