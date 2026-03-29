import type { DocFrontmatter } from "@/lib/manual/schemas";

const labels: Record<DocFrontmatter["category"], string> = {
  leis: "Leis",
  decretos: "Decretos",
  "instrucoes-normativas": "Instruções normativas",
  procedimentos: "Procedimentos fiscais",
  exemplos: "Exemplos práticos",
  faq: "Perguntas frequentes",
};

export function categoryLabel(
  category: DocFrontmatter["category"],
): string {
  return labels[category];
}
