export type ManualNavNode = {
  id: string;
  title: string;
  /** Caminho absoluto, ex: /manual/leis/nome-do-arquivo */
  href?: string;
  children?: ManualNavNode[];
  badge?: string;
};

export type BreadcrumbItem = {
  title: string;
  href?: string;
};

export type SearchIndexEntry = {
  title: string;
  description: string;
  slug: string[];
  category: string;
  excerpt: string;
};
