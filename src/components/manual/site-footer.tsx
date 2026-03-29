import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/30 dark:bg-muted/10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_minmax(0,2fr)] lg:gap-12 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {siteConfig.shortName}
          </p>
          <p className="mt-2 text-2xs uppercase tracking-[0.14em] text-muted-foreground">
            Orientação tributária
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex text-sm text-primary hover:underline"
          >
            Voltar ao início
          </Link>
        </div>
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Conteúdo de natureza <strong className="font-medium text-foreground">orientativa</strong>.
            Confirme sempre com a legislação vigente, com os atos publicados pelos
            órgãos competentes e com a assessoria jurídica institucional. Este
            manual não substitui publicação oficial nem consulta processual
            individual.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-2xs text-muted-foreground">
        Estado do Pará · ITCD
      </div>
    </footer>
  );
}
