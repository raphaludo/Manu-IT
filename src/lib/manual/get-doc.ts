import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ReactElement } from "react";
import { docFrontmatterSchema, type DocFrontmatter } from "@/lib/manual/schemas";
import { mdxComponents } from "@/lib/manual/mdx-components";
import { mdxPathFromSlug } from "@/lib/manual/paths";

export type CompiledDoc = {
  frontmatter: DocFrontmatter;
  content: ReactElement;
  rawSource: string;
};

export async function getDocBySlug(slug: string[]): Promise<CompiledDoc | null> {
  const filePath = mdxPathFromSlug(slug);
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

  if (parsed.data.draft) {
    return null;
  }

  const compiled = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return {
    frontmatter: parsed.data,
    content: compiled.content as ReactElement,
    rawSource: content,
  };
}

export async function getDocMetaForSlug(slug: string[]): Promise<DocFrontmatter | null> {
  const filePath = mdxPathFromSlug(slug);
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

export async function fileExistsForSlug(slug: string[]): Promise<boolean> {
  const filePath = mdxPathFromSlug(slug);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Slugs derivados de arquivos .mdx em content/manual (alternativa ao manifest) */
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
      } else if (e.isFile() && e.name.endsWith(".mdx")) {
        const base = e.name.replace(/\.mdx$/, "");
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
