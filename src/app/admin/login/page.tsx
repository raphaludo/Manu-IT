import Link from "next/link";
import { isAdminConfigured } from "@/lib/visual-pages/auth";
import { AdminLoginForm } from "@/app/admin/login/admin-login-form";

export default function AdminLoginPage() {
  const configured = isAdminConfigured();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl">
        <h1 className="text-center font-serif text-xl font-semibold text-white">
          Acesso ao editor
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Conteúdo visual (estilo construtor de páginas)
        </p>

        {!configured ? (
          <p className="mt-6 rounded-lg border border-amber-900/50 bg-amber-950/30 p-3 text-sm text-amber-200">
            Defina <code className="rounded bg-zinc-800 px-1">CONTENT_ADMIN_SECRET</code>{" "}
            no ambiente (mínimo 8 caracteres) e reinicie o servidor.
          </p>
        ) : (
          <AdminLoginForm />
        )}

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="text-zinc-400 hover:text-white">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
