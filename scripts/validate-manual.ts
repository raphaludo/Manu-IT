import fs from "fs/promises";
import path from "path";
import {
  manualNavigation,
  getAllManualSlugs,
} from "../src/lib/manual/manifest";
import { mdxPathFromSlug } from "../src/lib/manual/paths";
import type { ManualNavNode } from "../src/types/manual";

function collectHrefs(nodes: ManualNavNode[]): string[] {
  const hrefs: string[] = [];
  for (const n of nodes) {
    if (n.href) hrefs.push(n.href);
    if (n.children?.length) hrefs.push(...collectHrefs(n.children));
  }
  return hrefs;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const hrefs = collectHrefs(manualNavigation);
  let errors = 0;
  for (const href of hrefs) {
    if (!href.startsWith("/manual/")) {
      console.error(`Href inválido (deve começar com /manual/): ${href}`);
      errors++;
      continue;
    }
    const slug = href.replace(/^\/manual\/?/, "").split("/").filter(Boolean);
    const filePath = mdxPathFromSlug(slug);
    if (!(await pathExists(filePath))) {
      console.error(`Arquivo ausente para ${href}: esperado ${filePath}`);
      errors++;
    }
  }

  const slugs = getAllManualSlugs();
  for (const slug of slugs) {
    const filePath = mdxPathFromSlug(slug);
    if (!(await pathExists(filePath))) {
      console.error(`Slug no manifest sem arquivo: ${slug.join("/")}`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\nvalidate:manual falhou com ${errors} erro(s).`);
    process.exit(1);
  }
  console.log("validate:manual OK — manifest e arquivos alinhados.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
