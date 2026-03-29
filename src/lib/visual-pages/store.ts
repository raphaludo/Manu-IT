import fs from "fs/promises";
import path from "path";
import { visualPageSchema, type VisualPage } from "@/lib/visual-pages/schema";

const ROOT = path.join(process.cwd(), "content", "visual-pages");

function filePath(slug: string): string {
  return path.join(ROOT, `${slug}.json`);
}

export async function ensureVisualPagesDir(): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
}

export async function listVisualPageSlugs(): Promise<string[]> {
  try {
    const names = await fs.readdir(ROOT);
    return names
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export async function getVisualPage(slug: string): Promise<VisualPage | null> {
  try {
    const raw = await fs.readFile(filePath(slug), "utf8");
    const json = JSON.parse(raw) as unknown;
    const parsed = visualPageSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function saveVisualPage(page: VisualPage): Promise<void> {
  await ensureVisualPagesDir();
  const validated = visualPageSchema.parse(page);
  await fs.writeFile(
    filePath(validated.slug),
    JSON.stringify(validated, null, 2),
    "utf8",
  );
}

export async function deleteVisualPage(slug: string): Promise<void> {
  try {
    await fs.unlink(filePath(slug));
  } catch {
    // ignore
  }
}

export function emptyPage(slug: string, title: string): VisualPage {
  return {
    slug,
    title,
    description: "",
    updatedAt: new Date().toISOString(),
    blocks: [],
  };
}
