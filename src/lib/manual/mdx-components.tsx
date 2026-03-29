import type { MDXComponents } from "mdx/types";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function plainText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props.children) return plainText(props.children);
  }
  return "";
}

function createHeading(Tag: "h1" | "h2" | "h3" | "h4") {
  return function Heading({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const id = slugify(plainText(children));
    return React.createElement(
      Tag,
      {
        id,
        className: cn(
          "scroll-mt-24 font-serif font-semibold tracking-tight text-foreground",
          Tag === "h1" && "text-3xl",
          Tag === "h2" && "mt-10 border-b border-border pb-2 text-2xl",
          Tag === "h3" && "mt-8 text-xl",
          Tag === "h4" && "mt-6 text-lg",
          className,
        ),
        ...props,
      },
      children,
    );
  };
}

export const mdxComponents = {
  h1: createHeading("h1"),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  h4: createHeading("h4"),
  a: ({
    className,
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:text-primary/90",
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 list-disc pl-6", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-4 list-decimal pl-6", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("my-1", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "my-4 border-l-4 border-primary/40 pl-4 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-md border">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("bg-muted/50", className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn("border-b px-3 py-2 text-left font-medium", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn("border-b px-3 py-2 align-top", className)} {...props} />
  ),
  Callout: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <Alert className="my-6">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription className="text-base">{children}</AlertDescription>
    </Alert>
  ),
} as MDXComponents;
