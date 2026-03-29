"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageAction, deletePageAction } from "@/app/actions/visual-pages";

export function AdminPagesList({ initialSlugs }: { initialSlugs: string[] }) {
  const router = useRouter();
  const [slugs, setSlugs] = React.useState(initialSlugs);
  const [slug, setSlug] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSlugs(initialSlugs);
  }, [initialSlugs]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const s = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const res = await createPageAction(s, title.trim() || s);
    setBusy(false);
    if (res.ok) {
      setSlug("");
      setTitle("");
      router.refresh();
      router.push(`/admin/edit/${s}`);
    } else {
      setError(res.error ?? "Erro");
    }
  }

  async function onDelete(s: string) {
    if (!confirm(`Excluir a página "${s}"?`)) return;
    setDeleting(s);
    const res = await deletePageAction(s);
    setDeleting(null);
    if (res.ok) {
      setSlugs((prev) => prev.filter((x) => x !== s));
      router.refresh();
    } else {
      alert(res.error ?? "Erro ao excluir");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold text-foreground">
        Páginas visuais
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Crie páginas com editor em blocos (texto rico, imagens, destaques, CTAs).
        Em produção na Vercel, salve localmente e faça commit dos arquivos em{" "}
        <code className="rounded bg-muted px-1 font-mono text-xs">
          content/visual-pages/
        </code>{" "}
        ou integre banco de dados.
      </p>

      <form
        onSubmit={onCreate}
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold">Nova página</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Slug (URL)
            </label>
            <Input
              className="mt-1 font-mono text-sm"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex.: comunicado-2026"
              required
            />
          </div>
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Título
            </label>
            <Input
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título exibido no topo"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
        <Button type="submit" className="mt-4" disabled={busy}>
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Criar e editar
        </Button>
      </form>

      <ul className="mt-10 space-y-2">
        {slugs.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Nenhuma página ainda.
          </li>
        ) : (
          slugs.sort().map((s) => (
            <li
              key={s}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
            >
              <code className="min-w-0 flex-1 truncate text-sm">{s}</code>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/paginas/${s}`} target="_blank">
                  Ver
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/admin/edit/${s}`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                disabled={deleting === s}
                onClick={() => onDelete(s)}
                aria-label="Excluir"
              >
                {deleting === s ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
