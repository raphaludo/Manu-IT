import type { ManualNavNode } from "@/types/manual";
import { slugFromManualPath } from "@/lib/manual/paths";

export const manualNavigation: ManualNavNode[] = [
  {
    id: "leis",
    title: "Leis",
    children: [
      {
        id: "lei-itcd-pa",
        title: "Lei estadual — ITCD (exemplo)",
        href: "/manual/leis/lei-estadual-itcd",
      },
    ],
  },
  {
    id: "decretos",
    title: "Decretos",
    children: [
      {
        id: "decreto-placeholder",
        title: "Decretos regulamentadores (em construção)",
        href: "/manual/decretos/regulamentacao",
      },
    ],
  },
  {
    id: "instrucoes-normativas",
    title: "Instruções normativas",
    children: [
      {
        id: "in-placeholder",
        title: "IN — procedimentos (em construção)",
        href: "/manual/instrucoes-normativas/procedimentos-gerais",
      },
    ],
  },
  {
    id: "procedimentos",
    title: "Procedimentos fiscais",
    children: [
      {
        id: "proc-declaracao",
        title: "Declaração e pagamento (exemplo)",
        href: "/manual/procedimentos/declaracao-pagamento",
      },
    ],
  },
  {
    id: "exemplos",
    title: "Exemplos práticos",
    children: [
      {
        id: "exemplo-calculo",
        title: "Exemplo de cálculo orientativo",
        href: "/manual/exemplos/calculo-exemplo",
      },
    ],
  },
  {
    id: "faq",
    title: "Perguntas frequentes",
    children: [
      {
        id: "faq-isencoes",
        title: "Isenções e imunidades",
        href: "/manual/faq/isencoes",
      },
    ],
  },
];

function walk(
  nodes: ManualNavNode[],
  visit: (n: ManualNavNode) => void,
): void {
  for (const n of nodes) {
    visit(n);
    if (n.children?.length) walk(n.children, visit);
  }
}

export function getAllManualSlugs(): string[][] {
  const slugs: string[][] = [];
  walk(manualNavigation, (n) => {
    if (n.href?.startsWith("/manual/")) {
      const s = slugFromManualPath(n.href);
      if (s.length) slugs.push(s);
    }
  });
  return slugs;
}

export function findTrailToHref(
  nodes: ManualNavNode[],
  targetHref: string,
  trail: ManualNavNode[] = [],
): ManualNavNode[] | null {
  for (const n of nodes) {
    const next = [...trail, n];
    if (n.href === targetHref) return next;
    if (n.children?.length) {
      const found = findTrailToHref(n.children, targetHref, next);
      if (found) return found;
    }
  }
  return null;
}
