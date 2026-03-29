import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutPanelLeft, ListTree, Search } from "lucide-react";
import { HomeJsonLd } from "@/components/manual/home-json-ld";
import { manualNavigation } from "@/lib/manual/manifest";
import { getCategoryVisual } from "@/lib/manual/category-visual";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Início",
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
  },
};

const howTo = [
  {
    title: "Busca instantânea",
    desc: "Encontre qualquer página por palavra-chave, como em manuais técnicos de referência.",
    icon: Search,
    hint: "Atalho Ctrl K",
  },
  {
    title: "Navegação por tema",
    desc: "Leis, decretos, procedimentos e FAQ organizados em seções fixas na lateral.",
    icon: LayoutPanelLeft,
    hint: "Menu à esquerda",
  },
  {
    title: "Leitura guiada",
    desc: "Em cada artigo, o sumário à direita destaca as seções enquanto você rola a página.",
    icon: ListTree,
    hint: "Telas largas",
  },
] as const;

export default function ManualHomePage() {
  return (
    <>
      <HomeJsonLd />
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-hero-mesh dark:bg-hero-mesh-dark"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-primary">
            Manual tributário · Estado do Pará
          </p>
          <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
            {siteConfig.name}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={manualNavigation[0]?.children?.[0]?.href ?? "#"}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-doc transition hover:bg-primary/90"
            >
              Começar pela primeira seção
              <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
            </Link>
            <p className="text-2xs text-muted-foreground sm:text-sm">
              Ou escolha um tema abaixo.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
        <section aria-labelledby="how-heading" className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-doc backdrop-blur-sm dark:bg-card/40 sm:p-8">
          <h2
            id="how-heading"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Como usar este manual
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Interface pensada no padrão de grandes portais de documentação: rápida
            de consultar no dia a dia da fiscalização.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {howTo.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground sm:text-[13px]">
                    {item.desc}
                  </p>
                  <p className="mt-2 text-2xs font-medium uppercase tracking-wide text-primary/90">
                    {item.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Explore por tema
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada bloco reúne os documentos daquela linha normativa.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {manualNavigation.map((cat) => {
            const first = cat.children?.find((c) => c.href);
            const { Icon, blurb } = getCategoryVisual(cat.id);
            return (
              <article
                key={cat.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-doc transition hover:border-primary/25 hover:shadow-doc-md dark:bg-card/50"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10 dark:from-primary/25 dark:to-primary/10">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                      {cat.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {blurb}
                    </p>
                  </div>
                </div>

                {cat.children?.length ? (
                  <ul className="mt-5 space-y-1 border-t border-border/60 pt-5">
                    {cat.children.map((child) =>
                      child.href ? (
                        <li key={child.id}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg py-2 pl-2 pr-1 text-sm text-muted-foreground transition-colors",
                              "hover:bg-muted/70 hover:text-foreground",
                              "group-hover:border-transparent",
                            )}
                          >
                            <span className="min-w-0 truncate font-medium">
                              {child.title}
                            </span>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                ) : null}

                {first ? (
                  <Link
                    href={first.href!}
                    className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Abrir primeira página
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
