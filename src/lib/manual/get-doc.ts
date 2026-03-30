import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { docFrontmatterSchema, type DocFrontmatter } from "@/lib/manual/schemas";
import { htmlPathFromSlug } from "@/lib/manual/paths";

export type CompiledDoc = {
  frontmatter: DocFrontmatter;
  contentHtml: string;
  rawSource: string;
};

export async function getDocBySlug(slug: string[]): Promise<CompiledDoc | null> {
  const filePath = htmlPathFromSlug(slug);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const parsed = docFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      `Frontmatter inválido em ${filePath}:`,
      parsed.error.flatten(),
    );
    return null;
  }
  if (parsed.data.draft) return null;

  return {
    frontmatter: parsed.data,
    contentHtml: content,
    rawSource: content,
  };
}

export async function getDocMetaForSlug(slug: string[]): Promise<DocFrontmatter | null> {
  const filePath = htmlPathFromSlug(slug);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
  const { data } = matter(raw);
  const parsed = docFrontmatterSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

/** Slugs derivados de arquivos .html em content/manual */
export async function discoverSlugsFromDisk(): Promise<string[][]> {
  const root = path.join(process.cwd(), "content", "manual");
  const results: string[][] = [];

  async function walk(dir: string, parts: string[]): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full, [...parts, e.name]);
      } else if (e.isFile() && e.name.endsWith(".html")) {
        const base = e.name.replace(/\.html$/, "");
        results.push([...parts, base]);
      }
    }
  }

  try {
    await walk(root, []);
  } catch {
    // pasta ausente
  }
  return results;
}
