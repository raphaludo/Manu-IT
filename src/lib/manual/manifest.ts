import type { ManualNavNode } from "@/types/manual";
import { slugFromManualPath } from "@/lib/manual/paths";

export const manualNavigation: ManualNavNode[] = [
  {
    id: "apresentacao",
    title: "Apresentação (Camada Institucional)",
    children: [
      {
        id: "apresentacao-base",
        title: "Finalidade, escopo e uso pelo auditor",
        href: "/manual/estrutura-hibrida/apresentacao",
      },
    ],
  },
  {
    id: "parte-i",
    title: "Parte I — Fundamentos Jurídicos e Normativos",
    children: [
      {
        id: "parte-i-base",
        title: "Competência, natureza e marco normativo",
        href: "/manual/estrutura-hibrida/parte-i-fundamentos",
      },
    ],
  },
  {
    id: "parte-ii",
    title: "Parte II — Regra Matriz do ITCD",
    children: [
      {
        id: "parte-ii-base",
        title: "Critérios material, temporal, espacial, pessoal e quantitativo",
        href: "/manual/estrutura-hibrida/parte-ii-regra-matriz",
      },
    ],
  },
  {
    id: "parte-iii",
    title: "Parte III — Não Incidência, Imunidades e Benefícios",
    children: [
      {
        id: "parte-iii-base",
        title: "Não incidência, imunidades e isenções",
        href: "/manual/estrutura-hibrida/parte-iii-nao-incidencia",
      },
    ],
  },
  {
    id: "parte-iv",
    title: "Parte IV — Base de Cálculo e Avaliação de Bens",
    children: [
      {
        id: "parte-iv-base",
        title: "Avaliação, arbitramento e riscos fiscais",
        href: "/manual/estrutura-hibrida/parte-iv-base-calculo",
      },
    ],
  },
  {
    id: "parte-v",
    title: "Parte V — Fiscalização do ITCD",
    children: [
      {
        id: "parte-v-base",
        title: "Fluxo operacional, declarações e indícios",
        href: "/manual/estrutura-hibrida/parte-v-fiscalizacao",
      },
    ],
  },
  {
    id: "parte-vi",
    title: "Parte VI — Constituição do Crédito Tributário",
    children: [
      {
        id: "parte-vi-base",
        title: "Apuração, encargos, penalidades e auto de infração",
        href: "/manual/estrutura-hibrida/parte-vi-credito",
      },
    ],
  },
  {
    id: "parte-vii",
    title: "Parte VII — Casos Práticos e Situações Reais",
    children: [
      {
        id: "parte-vii-base",
        title: "Casos estruturados para aplicação prática",
        href: "/manual/estrutura-hibrida/parte-vii-casos",
      },
    ],
  },
  {
    id: "parte-viii",
    title: "Parte VIII — Roteiros e Padrões Operacionais",
    children: [
      {
        id: "parte-viii-base",
        title: "Roteiros de fiscalização e modelos padronizados",
        href: "/manual/estrutura-hibrida/parte-viii-roteiros",
      },
    ],
  },
  {
    id: "parte-ix",
    title: "Parte IX — Fluxos Operacionais (IA Ready)",
    children: [
      {
        id: "parte-ix-base",
        title: "Fluxos decisórios em lógica SE/ENTÃO/SENÃO",
        href: "/manual/estrutura-hibrida/parte-ix-fluxos",
      },
    ],
  },
  {
    id: "parte-x",
    title: "Parte X — Suporte ao Auditor",
    children: [
      {
        id: "parte-x-base",
        title: "Glossário, FAQ fiscal e pontos controversos",
        href: "/manual/estrutura-hibrida/parte-x-suporte",
      },
    ],
  },
  {
    id: "anexos",
    title: "Anexos",
    children: [
      {
        id: "anexos-base",
        title: "Modelos, tabelas, quadros-resumo e referências",
        href: "/manual/estrutura-hibrida/anexos",
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
