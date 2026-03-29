/**
 * Contratos para a Fase 2 (chat + RAG). Sem implementação de runtime aqui.
 */

export type ManualChunk = {
  id: string;
  /** Slug do documento, ex.: leis/lei-estadual-itcd */
  slug: string[];
  /** Caminho de títulos, ex.: ["Objeto", "Alíquotas"] */
  headingPath: string[];
  content: string;
  /** Hash ou versão do arquivo fonte para invalidação */
  sourceVersion: string;
  updatedAt: string;
};

export type Citation = {
  chunkId: string;
  slug: string[];
  headingPath: string[];
  excerpt: string;
  href: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

export type EmbeddingRecord = {
  chunkId: string;
  /** Vetor serializado ou referência à linha no Supabase pgvector */
  embeddingRef: string;
};
