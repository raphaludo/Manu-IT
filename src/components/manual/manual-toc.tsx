"use client";

import * as React from "react";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; title: string; depth: 2 | 3 };

export function ManualToc() {
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const root = document.getElementById("article-body");
    if (!root) return;
    const headings = root.querySelectorAll("h2, h3");
    const next: TocItem[] = [];
    headings.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag !== "h2" && tag !== "h3") return;
      const id = el.id || "";
      if (!id) return;
      next.push({
        id,
        title: el.textContent ?? "",
        depth: tag === "h2" ? 2 : 3,
      });
    });
    setItems(next);
  }, []);

  React.useEffect(() => {
    if (!items.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: [0, 1] },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Sumário da página"
      className="hidden w-[13.5rem] shrink-0 xl:block"
    >
      <div className="sticky top-24 pb-8">
        <div className="mb-4 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <ListTree className="h-3.5 w-3.5 text-primary/80" aria-hidden />
          Nesta página
        </div>
        <ul className="relative space-y-0.5 border-l border-border pl-3">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block rounded-r-md py-1.5 text-[13px] leading-snug transition-colors",
                  item.depth === 3 && "pl-2 text-[12px] text-muted-foreground",
                  item.depth === 2 && "pl-0 text-muted-foreground",
                  "hover:bg-muted/60 hover:text-foreground",
                  activeId === item.id &&
                    "-ml-px border-l-2 border-primary pl-[11px] font-medium text-foreground dark:text-foreground",
                  activeId === item.id &&
                    item.depth === 3 &&
                    "pl-[19px] text-foreground",
                )}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
