import Link from "next/link";
import { logoutVisualAdmin } from "@/app/actions/visual-pages";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <nav className="flex h-12 shrink-0 items-center gap-6 border-b border-zinc-800 px-4 sm:px-6">
        <Link
          href="/admin"
          className="text-sm font-semibold tracking-tight text-white hover:text-zinc-200"
        >
          Editor visual
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Ver site
        </Link>
        <Link
          href="/paginas"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          Páginas públicas
        </Link>
        <form action={logoutVisualAdmin} className="ml-auto">
          <button
            type="submit"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Sair
          </button>
        </form>
      </nav>
      <div className="flex-1 bg-muted/30 text-foreground">{children}</div>
    </div>
  );
}
