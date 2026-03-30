import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { ManualBreadcrumbs } from "@/components/manual/manual-breadcrumbs";
import { ManualToc } from "@/components/manual/manual-toc";
import { siteConfig } from "@/config/site";
import {
  discoverSlugsFromDisk,
  getDocBySlug,
  getDocMetaForSlug,
} from "@/lib/manual/get-doc";
import { getAllManualSlugs } from "@/lib/manual/manifest";
import { manualHrefFromSlug } from "@/lib/manual/paths";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  const fromManifest = getAllManualSlugs();
  const fromDisk = await discoverSlugsFromDisk();
  const map = new Map<string, string[]>();
  const add = (s: string[]) => {
    if (s.length) map.set(s.join("/"), s);
  };
  fromManifest.forEach(add);
  fromDisk.forEach(add);
  return [...map.values()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocMetaForSlug(slug);
  if (!doc) {
    return { title: "Página não encontrada" };
  }
  const url = `${siteConfig.url}${manualHrefFromSlug(slug)}`;
  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url,
    },
    alternates: { canonical: manualHrefFromSlug(slug) },
  };
}

export default async function ManualDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) notFound();
  const isManualCompleto = slug.join("/") === "estrutura-hibrida/manual-completo";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:px-8 xl:gap-14">
      <article
        id="article-body"
        className="doc-prose-width min-w-0 flex-1"
      >
        <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-doc dark:bg-card/40 sm:p-8 lg:p-10">
          <div className="not-prose">
            <ManualBreadcrumbs
              title={doc.frontmatter.title}
              category={doc.frontmatter.category}
            />
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
              {doc.frontmatter.title}
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              {doc.frontmatter.description}
            </p>
            {isManualCompleto ? (
              <a
                href="/api/manual-completo/pdf"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Baixar manual completo em PDF
              </a>
            ) : null}
          </div>
          <div
            className="prose prose-slate mt-10 max-w-none font-serif dark:prose-invert prose-headings:scroll-mt-28 prose-headings:font-semibold prose-p:leading-relaxed prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
          />
          <footer className="not-prose mt-12 border-t border-border/80 pt-8 text-sm text-muted-foreground">
            {doc.frontmatter.updated ? (
              <p>
                <span className="font-medium text-foreground">Atualizado em</span>{" "}
                {doc.frontmatter.updated}
              </p>
            ) : null}
            <p className="mt-3 text-2xs leading-relaxed sm:text-sm">
              ITCD — Imposto sobre Transmissão Causa Mortis e Doação de Quaisquer
              Bens ou Direitos · Estado do Pará.
            </p>
          </footer>
        </div>
      </article>
      <ManualToc />
    </div>
  );
}
