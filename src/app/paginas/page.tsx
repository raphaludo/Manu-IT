import type { Metadata } from "next";
import Link from "next/link";
import { listVisualPageSlugs } from "@/lib/visual-pages/store";
export const metadata: Metadata = {
  title: "Páginas",
  description: "Páginas institucionais criadas com o editor visual.",
};

export default async function PaginasIndexPage() {
  const slugs = await listVisualPageSlugs();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Páginas publicadas
      </h1>
      <p className="mt-2 text-muted-foreground">
        Conteúdo produzido no editor visual (blocos, mídia e destaques).
      </p>
      <ul className="mt-8 space-y-2">
        {slugs.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            Nenhuma página em{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              content/visual-pages
            </code>
            .
          </li>
        ) : (
          slugs.sort().map((slug) => (
            <li key={slug}>
              <Link
                href={`/paginas/${slug}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:border-primary/30 hover:bg-muted/30"
              >
                {slug}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
