import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function PaginasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/paginas"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Páginas
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {siteConfig.shortName}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
