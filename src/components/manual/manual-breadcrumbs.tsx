import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryLabel } from "@/lib/manual/category-labels";
import type { DocFrontmatter } from "@/lib/manual/schemas";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  category: DocFrontmatter["category"];
};

export function ManualBreadcrumbs({ title, category }: Props) {
  return (
    <nav
      aria-label="Trilha de navegação"
      className="mb-8 flex flex-wrap items-center gap-x-1 gap-y-1 text-2xs text-muted-foreground sm:text-[13px]"
    >
      <Link
        href="/"
        className="rounded-md px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
      >
        Início
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
      <span className="text-muted-foreground/80">{categoryLabel(category)}</span>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
      <span
        className={cn(
          "max-w-[min(100%,28rem)] truncate font-medium text-foreground",
        )}
        title={title}
      >
        {title}
      </span>
    </nav>
  );
}
