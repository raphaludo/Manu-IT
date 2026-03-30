import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Calculator,
  CircleHelp,
  ClipboardList,
  FileStack,
  Scale,
} from "lucide-react";

/** Ícone e descrição curta por categoria — usado na home e na sidebar (padrão docs profissionais). */
export const CATEGORY_VISUAL: Record<
  string,
  { Icon: LucideIcon; blurb: string }
> = {
  leis: {
    Icon: Scale,
    blurb: "Textos legais estaduais e remissões à base normativa do ITCD.",
  },
  decretos: {
    Icon: BookMarked,
    blurb: "Atos do Poder Executivo que regulamentam procedimentos e prazos.",
  },
  "instrucoes-normativas": {
    Icon: FileStack,
    blurb: "Orientações administrativas e padronização interna.",
  },
  procedimentos: {
    Icon: ClipboardList,
    blurb: "Passo a passo para declaração, pagamento e obrigações acessórias.",
  },
  exemplos: {
    Icon: Calculator,
    blurb: "Ilustrações práticas e hipóteses didáticas (sempre conferir a norma).",
  },
  faq: {
    Icon: CircleHelp,
    blurb: "Respostas objetivas às dúvidas mais frequentes da equipe fiscal.",
  },
  apresentacao: {
    Icon: FileStack,
    blurb: "Objetivos, escopo e diretrizes de uso institucional do manual.",
  },
  "parte-i": {
    Icon: Scale,
    blurb: "Fundamentos jurídicos e normativos aplicáveis ao ITCD no Pará.",
  },
  "parte-ii": {
    Icon: BookMarked,
    blurb: "Regra-matriz de incidência como núcleo técnico do sistema.",
  },
  "parte-iii": {
    Icon: CircleHelp,
    blurb: "Não incidência, imunidades e benefícios com controle fiscal.",
  },
  "parte-iv": {
    Icon: Calculator,
    blurb: "Base de cálculo, avaliação de bens e arbitramento fiscal.",
  },
  "parte-v": {
    Icon: ClipboardList,
    blurb: "Fluxo operacional de fiscalização e análise de indícios.",
  },
  "parte-vi": {
    Icon: FileStack,
    blurb: "Constituição do crédito tributário e auto de infração.",
  },
  "parte-vii": {
    Icon: Calculator,
    blurb: "Casos práticos estruturados para aplicação em campo.",
  },
  "parte-viii": {
    Icon: ClipboardList,
    blurb: "Roteiros e modelos padronizados de atuação fiscal.",
  },
  "parte-ix": {
    Icon: BookMarked,
    blurb: "Fluxos decisórios em lógica aplicável à automação.",
  },
  "parte-x": {
    Icon: CircleHelp,
    blurb: "Glossário, FAQ fiscal e tratamento de controvérsias.",
  },
  anexos: {
    Icon: FileStack,
    blurb: "Modelos, tabelas, quadros-resumo e referências normativas.",
  },
};

export function getCategoryVisual(id: string) {
  return (
    CATEGORY_VISUAL[id] ?? {
      Icon: FileStack,
      blurb: "Conteúdo do manual.",
    }
  );
}
