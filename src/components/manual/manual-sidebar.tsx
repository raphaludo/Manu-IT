"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { manualNavigation } from "@/lib/manual/manifest";
import { getCategoryVisual } from "@/lib/manual/category-visual";
import type { ManualNavNode } from "@/types/manual";

function NavBranch({
  nodes,
  depth,
}: {
  nodes: ManualNavNode[];
  depth: number;
}) {
  const pathname = usePathname();

  return (
    <ul className={cn("space-y-0.5", depth > 0 && "mt-1 space-y-0.5 pl-2.5")}>
      {nodes.map((node) => {
        const isSection = !node.href && node.children?.length;
        const visual = isSection ? getCategoryVisual(node.id) : null;
        const Icon = visual?.Icon;
        const blurb = visual?.blurb ?? "";

        return (
          <li key={node.id}>
            {node.href ? (
              <Link
                href={node.href}
                className={cn(
                  "group relative flex items-start gap-2 rounded-lg py-2 pl-3 pr-2 text-[13px] leading-snug transition-colors",
                  "hover:bg-foreground/[0.04] dark:hover:bg-white/[0.06]",
                  pathname === node.href &&
                    "bg-primary/[0.08] font-medium text-primary dark:bg-primary/15 dark:text-primary",
                )}
              >
                {pathname === node.href ? (
                  <span
                    className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-primary"
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0 flex-1 text-sidebar-foreground group-hover:text-foreground">
                  {node.title}
                </span>
                {node.badge ? (
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-px text-2xs font-medium uppercase text-muted-foreground">
                    {node.badge}
                  </span>
                ) : null}
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-start gap-2.5 px-1 pb-1 pt-4 first:pt-2",
                  depth > 0 && "pt-3",
                )}
              >
                {Icon ? (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/20">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {node.title}
                  </p>
                  {blurb ? (
                    <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground/90">
                      {blurb}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
            {node.children?.length ? (
              <NavBranch nodes={node.children} depth={depth + 1} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

type SidebarVariant = "default" | "drawer";

export function ManualSidebar({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: SidebarVariant;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        variant === "default" && "border-r border-sidebar-border",
        className,
      )}
    >
      <div
        className={cn(
          "border-b border-sidebar-border px-4 py-4",
          variant === "drawer" && "px-5",
        )}
      >
        <Link
          href="/"
          className="block text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          Manual ITCD — Pará
        </Link>
        <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground">
          Navegue por tema. Em telas menores, use o menu ou{" "}
          <kbd className="rounded border border-border bg-background px-1 py-px font-mono text-[10px]">
            Ctrl K
          </kbd>{" "}
          para buscar.
        </p>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <nav aria-label="Manual por tema">
          <NavBranch nodes={manualNavigation} depth={0} />
        </nav>
      </ScrollArea>
    </div>
  );
}
