import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { docFrontmatterSchema } from "../src/lib/manual/schemas";
import { plainTextFromMdx } from "../src/lib/manual/plain-text";

const ROOT = path.join(process.cwd(), "content", "manual");
const OUT = path.join(process.cwd(), "public", "search-index.json");

async function walk(dir: string, parts: string[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, [...parts, e.name]);
    } else if (e.isFile() && e.name.endsWith(".mdx")) {
      const base = e.name.replace(/\.mdx$/, "");
      const slug = [...parts, base];
      const raw = await fs.readFile(full, "utf8");
      const { data, content } = matter(raw);
      const parsed = docFrontmatterSchema.safeParse(data);
      if (!parsed.success || parsed.data.draft) continue;
      const excerpt = plainTextFromMdx(content).slice(0, 280);
      rows.push({
        title: parsed.data.title,
        description: parsed.data.description,
        slug,
        category: parsed.data.category,
        excerpt: excerpt + (excerpt.length >= 280 ? "…" : ""),
      });
    }
  }
}

const rows: Array<{
  title: string;
  description: string;
  slug: string[];
  category: string;
  excerpt: string;
}> = [];

async function main() {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  try {
    await walk(ROOT, []);
  } catch {
    console.warn("Aviso: content/manual não encontrado; índice vazio.");
  }
  await fs.writeFile(OUT, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Índice de busca gravado em ${OUT} (${rows.length} itens).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
