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
      threshold: 0.32,
      ignoreLocation: true,
    });
  }, [items]);

  const results = React.useMemo(() => {
    if (!items.length) return [];
    const q = query.trim();
    if (!q) return items;
    return fuse.search(q).map((r) => r.item);
  }, [query, items, fuse]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "relative h-9 justify-start gap-2 rounded-full border-border/80 bg-muted/40 text-muted-foreground shadow-none transition-all hover:bg-muted/70 hover:text-foreground",
          compact
            ? "w-9 shrink-0 px-0"
            : "w-full pl-3 pr-10 text-sm font-normal",
        )}
        aria-label={compact ? "Abrir busca no manual" : undefined}
      >
        <Search className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
        {!compact ? (
          <>
            <span className="truncate">Buscar documentação…</span>
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-6 -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-border/80 bg-background px-1.5 font-mono text-2xs font-medium text-muted-foreground sm:flex">
              <span className="text-[10px]">⌃</span>K
            </kbd>
          </>
        ) : null}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar títulos, tópicos e trechos…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
            Nenhum resultado. Tente outro termo ou navegue pelo menu lateral.
          </CommandEmpty>
          <CommandGroup
            heading="Documentos"
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
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 aria-selected:bg-primary/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight text-foreground">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-2xs leading-relaxed text-muted-foreground">
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
