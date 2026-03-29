"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  createAdminSessionToken,
  verifyAdminSession,
} from "@/lib/visual-pages/auth";
import {
  deleteVisualPage,
  emptyPage,
  getVisualPage,
  listVisualPageSlugs,
  saveVisualPage,
} from "@/lib/visual-pages/store";
import { visualPageSchema, type VisualPage } from "@/lib/visual-pages/schema";

const COOKIE = "visual_admin";

async function assertAdmin() {
  const secret = process.env.CONTENT_ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!verifyAdminSession(secret, token)) {
    throw new Error("Não autorizado");
  }
}

export async function loginVisualAdmin(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.CONTENT_ADMIN_SECRET?.trim();
  if (!secret || secret.length < 8) {
    return { ok: false, error: "CONTENT_ADMIN_SECRET não configurado (mín. 8 caracteres)." };
  }
  const password = String(formData.get("password") ?? "");
  if (password !== secret) {
    return { ok: false, error: "Senha incorreta." };
  }
  const token = createAdminSessionToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function logoutVisualAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
  redirect("/admin/login");
}

export async function listPagesAction(): Promise<{ slugs: string[] }> {
  await assertAdmin();
  const slugs = await listVisualPageSlugs();
  return { slugs };
}

export async function createPageAction(
  slug: string,
  title: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const s = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
    return { ok: false, error: "Slug inválido." };
  }
  const existing = await getVisualPage(s);
  if (existing) {
    return { ok: false, error: "Já existe página com este slug." };
  }
  const page = emptyPage(s, title.trim() || s);
  try {
    await saveVisualPage(page);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gravar.";
    return {
      ok: false,
      error:
        process.env.VERCEL === "1"
          ? "Na Vercel o disco é efêmero: crie páginas em desenvolvimento local e faça commit dos JSON em content/visual-pages, ou integre um banco (ex.: Supabase)."
          : msg,
    };
  }
  revalidatePath("/admin");
  revalidatePath("/paginas");
  revalidatePath(`/paginas/${s}`);
  return { ok: true };
}

export async function savePageAction(
  page: VisualPage,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const parsed = visualPageSchema.safeParse({
    ...page,
    updatedAt: new Date().toISOString(),
  });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }
  try {
    await saveVisualPage(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gravar.";
    return {
      ok: false,
      error:
        process.env.VERCEL === "1"
          ? "Gravação indisponível na Vercel (sem disco persistente). Edite localmente, commit os arquivos em content/visual-pages/ ou use banco de dados."
          : msg,
    };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/edit/${parsed.data.slug}`);
  revalidatePath("/paginas");
  revalidatePath(`/paginas/${parsed.data.slug}`);
  return { ok: true };
}

export async function deletePageAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  try {
    await deleteVisualPage(slug);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Falha ao excluir.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/paginas");
  return { ok: true };
}
