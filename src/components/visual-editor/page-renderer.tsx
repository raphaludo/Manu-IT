import Link from "next/link";
import { cn } from "@/lib/utils";
import type { VisualBlock, VisualPage } from "@/lib/visual-pages/schema";

const calloutStyles: Record<string, string> = {
  info: "border-blue-200 bg-blue-50/90 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-50",
  warning:
    "border-amber-200 bg-amber-50/90 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-50",
  success:
    "border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-50",
  note: "border-border bg-muted/60 text-foreground",
  legal: "border-primary/30 bg-primary/[0.06] text-foreground",
};

function RichHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-img:rounded-xl",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BlockView({ block }: { block: VisualBlock }) {
  switch (block.type) {
    case "richText":
      return <RichHtml html={block.html} className="prose-lg" />;
    case "image": {
      if (!block.src?.trim()) return null;
      return (
        <figure
          className={cn(
            "my-8",
            block.width === "full" && "w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 px-4",
            block.width === "wide" && "mx-auto max-w-4xl",
            block.width === "normal" && "mx-auto max-w-3xl",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt || ""}
            className="w-full rounded-xl border border-border/60 shadow-doc"
          />
          {block.caption ? (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "callout":
      return (
        <aside
          className={cn(
            "my-8 rounded-xl border px-5 py-4 shadow-sm",
            calloutStyles[block.variant] ?? calloutStyles.note,
          )}
        >
          {block.title ? (
            <p className="mb-2 text-sm font-semibold">{block.title}</p>
          ) : null}
          <RichHtml html={block.html} className="prose-sm" />
        </aside>
      );
    case "divider":
      return <hr className="my-10 border-border" />;
    case "spacer": {
      const h =
        block.size === "lg" ? "h-16" : block.size === "sm" ? "h-6" : "h-10";
      return <div className={h} aria-hidden />;
    }
    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-primary/50 bg-muted/30 py-4 pl-6 pr-4 italic text-muted-foreground">
          <RichHtml html={block.html} className="prose-sm not-italic text-foreground" />
          {block.attribution ? (
            <footer className="mt-3 text-sm font-medium not-italic text-foreground">
              — {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );
    case "buttons":
      return (
        <div className="my-8 flex flex-wrap gap-3">
          {block.items.map((btn, i) => (
            <Link
              key={i}
              href={btn.href}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors",
                btn.variant === "primary" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                btn.variant === "secondary" &&
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                btn.variant === "outline" &&
                  "border border-border bg-background hover:bg-muted",
              )}
            >
              {btn.label}
            </Link>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function VisualPageRenderer({ page }: { page: VisualPage }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
          {page.title}
        </h1>
        {page.description ? (
          <p className="mt-4 text-lg text-muted-foreground">{page.description}</p>
        ) : null}
        <p className="mt-4 text-2xs text-muted-foreground">
          Atualizado em{" "}
          {new Date(page.updatedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>
      <div className="space-y-2">
        {page.blocks.map((block) => (
          <div key={block.id}>
            <BlockView block={block} />
          </div>
        ))}
      </div>
    </article>
  );
}
