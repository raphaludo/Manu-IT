"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { manualHrefFromSlug } from "@/lib/manual/paths";
import { categoryLabel } from "@/lib/manual/category-labels";
import type { SearchIndexEntry } from "@/types/manual";
import type { DocFrontmatter } from "@/lib/manual/schemas";
import { cn } from "@/lib/utils";

type Props = {
  /** Versão compacta só com ícone (mobile / header estreito) */
  compact?: boolean;
};

export function SearchDialog({ compact = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<SearchIndexEntry[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchIndexEntry[]) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = React.useMemo(() => {
    return new Fuse(items, {
      keys: ["title", "description", "excerpt", "category"],
      includeScore: true,
      threshold: 0.28,
      ignoreLocation: true,
    });
  }, [items]);

  const normalize = React.useCallback(
    (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim(),
    [],
  );

  const featured = React.useMemo(() => items.slice(0, 8), [items]);

  const results = React.useMemo(() => {
    if (!items.length) return [];
    const q = query.trim();
    if (!q) return featured;
    const normalizedQ = normalize(q);

    const ranked = fuse.search(q).map((r) => {
      const item = r.item;
      const title = normalize(item.title);
      const description = normalize(item.description ?? "");
      const excerpt = normalize(item.excerpt ?? "");
      const category = normalize(item.category ?? "");

      let boost = 0;
      if (title === normalizedQ) boost += 0.24;
      else if (title.startsWith(normalizedQ)) boost += 0.16;
      else if (title.includes(normalizedQ)) boost += 0.1;
      if (description.includes(normalizedQ)) boost += 0.05;
      if (excerpt.includes(normalizedQ)) boost += 0.04;
      if (category.includes(normalizedQ)) boost += 0.03;

      return {
        item,
        score: (r.score ?? 1) - boost,
      };
    });

    return ranked
      .sort((a, b) => a.score - b.score)
      .slice(0, 24)
      .map((entry) => entry.item);
  }, [query, items, featured, fuse, normalize]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "relative h-9 justify-start gap-2 rounded-full border-primary/20 bg-secondary/35 text-muted-foreground shadow-none transition-all hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground",
          compact
            ? "w-9 shrink-0 px-0"
            : "w-full pl-3 pr-10 text-sm font-normal",
        )}
        aria-label={compact ? "Abrir busca no manual" : undefined}
      >
        <Search className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
        {!compact ? (
          <>
            <span className="truncate">Buscar na documentação...</span>
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-6 -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-border/80 bg-background px-1.5 font-mono text-2xs font-medium text-muted-foreground sm:flex">
              <span className="text-[10px]">⌃</span>K
            </kbd>
          </>
        ) : null}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar titulos, topicos e trechos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado. Tente termo mais curto ou mais especifico.
          </CommandEmpty>
          <CommandGroup
            heading={query.trim() ? "Resultados" : "Documentos em destaque"}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            {results.map((entry) => (
              <CommandItem
                key={entry.slug.join("/")}
                value={`${entry.title} ${entry.description} ${entry.excerpt}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(manualHrefFromSlug(entry.slug));
                }}
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:[&_svg]:text-primary-foreground data-[selected=true]:[&_.search-result-icon]:bg-primary-foreground/20 data-[selected=true]:[&_.search-result-meta]:text-primary-foreground/85 data-[selected=true]:[&_.search-result-title]:text-primary-foreground"
              >
                <span className="search-result-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <FileText className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="search-result-title block font-medium leading-tight text-foreground">
                    {entry.title}
                  </span>
                  <span className="search-result-meta mt-0.5 line-clamp-2 text-2xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-primary/90">
                      {categoryLabel(
                        entry.category as DocFrontmatter["category"],
                      )}
                    </span>
                    {entry.excerpt ? ` · ${entry.excerpt}` : ""}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
