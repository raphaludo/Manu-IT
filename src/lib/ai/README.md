# Fase 2 — IA, embeddings e Supabase (planejamento)

## Objetivo

Responder perguntas sobre o manual com **citações** para trechos oficiais (slug + âncora), usando **RAG** sobre o conteúdo em `content/manual/`.

## Pipeline proposto

1. **Ingestão**: em cada deploy ou job agendado, percorrer `.html` em `content/manual/`, aplicar chunking por seção (ex.: entre `h2`/`h3`) e gerar registros `ManualChunk` (ver `types.ts`).
2. **Embeddings**: calcular vetores com o provedor escolhido (API compatível com embeddings).
3. **Armazenamento**: Supabase **pgvector** — tabela sugerida:

   - `id` (uuid), `slug` (text[] ou text), `heading_path` (text[]), `content` (text), `embedding` (vector), `updated_at` (timestamptz), `content_hash` (text).

4. **Consulta**: query do usuário → embedding → similaridade no pgvector → top-k chunks → contexto para o modelo → resposta com `Citation[]` obrigatório na UI.

## Política de citação

- Toda resposta deve exibir trechos citáveis e links para `/manual/...` (e âncoras quando existirem).
- Se a confiança for baixa, responder com remissão à página estática em vez de inventar norma.

## Variáveis de ambiente (futuro)

Ver `.env.example` na raiz do projeto.

## Indexação

- **Fase 1**: `public/search-index.json` (Fuse.js no cliente).
- **Fase 2**: substituir/complementar com índice vetorial no Supabase; opcionalmente manter JSON para fallback offline.
