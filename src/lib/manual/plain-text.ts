/** Texto simples para excertos (busca) — remove blocos MDX/HTML aproximado */
export function plainTextFromMdx(source: string): string {
  return source
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
