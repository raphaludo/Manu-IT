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
};

export function getCategoryVisual(id: string) {
  return (
    CATEGORY_VISUAL[id] ?? {
      Icon: FileStack,
      blurb: "Conteúdo do manual.",
    }
  );
}
