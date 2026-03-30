import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getDocBySlug } from "@/lib/manual/get-doc";
import { getAllManualSlugs } from "@/lib/manual/manifest";
import { manualHrefFromSlug } from "@/lib/manual/paths";
import { plainTextFromHtml } from "@/lib/manual/html-text";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

type DocBlockType = "h1" | "h2" | "h3" | "p" | "li";

type DocBlock = {
  type: DocBlockType;
  text: string;
};

type DrawStyle = {
  font: PDFFont;
  size: number;
  lineHeight: number;
  color: { r: number; g: number; b: number };
  gapAfter: number;
  indent?: number;
};

type TocEntry = {
  title: string;
  level: 1 | 2;
  pageNumber: number;
  link: string;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanInlineHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim(),
  );
}

function withoutLeadingH1(html: string): string {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function blocksFromHtml(html: string, docTitle: string): DocBlock[] {
  const source = withoutLeadingH1(html);
  const regex = /<(h[1-3]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const blocks: DocBlock[] = [];

  for (const match of source.matchAll(regex)) {
    const tag = match[1]?.toLowerCase() as DocBlockType | undefined;
    const raw = match[2] ?? "";
    if (!tag) continue;
    const text = cleanInlineHtml(raw);
    if (!text) continue;
    if (tag === "h1" && text.trim().toLowerCase() === docTitle.trim().toLowerCase()) {
      continue;
    }
    blocks.push({ type: tag, text });
  }

  if (blocks.length) return blocks;
  const fallback = plainTextFromHtml(source);
  return fallback ? [{ type: "p", text: fallback }] : [];
}

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 52,
};

function splitLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());
}

function wrapLine(line: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = line.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const result: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      result.push(current);
      current = words[i];
    }
  }
  result.push(current);
  return result;
}

function ensurePage(
  pdf: PDFDocument,
  currentPage: PDFPage,
  y: number,
  neededHeight: number,
): { page: PDFPage; y: number } {
  const minY = PAGE.margin;
  if (y - neededHeight >= minY) return { page: currentPage, y };
  const page = pdf.addPage([PAGE.width, PAGE.height]);
  return { page, y: PAGE.height - PAGE.margin };
}

function drawTextBlock(
  pdf: PDFDocument,
  currentPage: PDFPage,
  y: number,
  text: string,
  style: DrawStyle,
): { page: PDFPage; y: number } {
  const indent = style.indent ?? 0;
  const maxWidth = PAGE.width - PAGE.margin * 2 - indent;
  const lines = splitLines(text).flatMap((line) =>
    wrapLine(line, style.font, style.size, maxWidth),
  );
  let page = currentPage;
  let cursorY = y;

  for (const line of lines) {
    const pageState = ensurePage(pdf, page, cursorY, style.lineHeight);
    page = pageState.page;
    cursorY = pageState.y;
    page.drawText(line || " ", {
      x: PAGE.margin + indent,
      y: cursorY - style.size,
      size: style.size,
      font: style.font,
      color: rgb(style.color.r, style.color.g, style.color.b),
    });
    cursorY -= style.lineHeight;
  }

  return { page, y: cursorY - style.gapAfter };
}

function styleForBlock(type: DocBlockType, fontRegular: PDFFont, fontBold: PDFFont): DrawStyle {
  if (type === "h1") {
    return {
      font: fontBold,
      size: 17,
      lineHeight: 25,
      color: { r: 0.043, g: 0.31, b: 0.541 },
      gapAfter: 8,
    };
  }
  if (type === "h2") {
    return {
      font: fontBold,
      size: 14,
      lineHeight: 21,
      color: { r: 0.067, g: 0.094, b: 0.153 },
      gapAfter: 6,
    };
  }
  if (type === "h3") {
    return {
      font: fontBold,
      size: 12,
      lineHeight: 18,
      color: { r: 0.067, g: 0.094, b: 0.153 },
      gapAfter: 4,
    };
  }
  if (type === "li") {
    return {
      font: fontRegular,
      size: 10.5,
      lineHeight: 16,
      color: { r: 0.067, g: 0.094, b: 0.153 },
      gapAfter: 1,
      indent: 12,
    };
  }
  return {
    font: fontRegular,
    size: 10.5,
    lineHeight: 16,
    color: { r: 0.067, g: 0.094, b: 0.153 },
    gapAfter: 4,
  };
}

function drawPageFooter(page: PDFPage, text: string, font: PDFFont) {
  page.drawText(text, {
    x: PAGE.margin,
    y: 24,
    size: 9,
    font,
    color: rgb(0.45, 0.49, 0.56),
  });
}

function drawCover(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  logoImage?: { width: number; height: number; draw: (opts: { x: number; y: number; width: number; height: number }) => void },
) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: rgb(0.97, 0.98, 1),
  });
  page.drawRectangle({
    x: 0,
    y: PAGE.height - 280,
    width: PAGE.width,
    height: 280,
    color: rgb(0.043, 0.31, 0.541),
  });
  page.drawRectangle({
    x: 0,
    y: PAGE.height - 295,
    width: PAGE.width,
    height: 8,
    color: rgb(0.102, 0.525, 0.91),
  });

  page.drawText("MANUAL ITCD/PA", {
    x: PAGE.margin,
    y: PAGE.height - 120,
    size: 32,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Versao consolidada", {
    x: PAGE.margin,
    y: PAGE.height - 156,
    size: 15,
    font: fontRegular,
    color: rgb(0.89, 0.94, 1),
  });
  page.drawText("Secretaria de Estado da Fazenda do Para", {
    x: PAGE.margin,
    y: PAGE.height - 180,
    size: 11,
    font: fontRegular,
    color: rgb(0.82, 0.9, 1),
  });

  if (logoImage) {
    const maxW = 220;
    const maxH = 90;
    const ratio = Math.min(maxW / logoImage.width, maxH / logoImage.height);
    const width = logoImage.width * ratio;
    const height = logoImage.height * ratio;
    logoImage.draw({
      x: PAGE.width - PAGE.margin - width,
      y: PAGE.height - 195,
      width,
      height,
    });
  }

  page.drawText(`Gerado em ${new Date().toLocaleString("pt-BR")}`, {
    x: PAGE.margin,
    y: 86,
    size: 10,
    font: fontRegular,
    color: rgb(0.32, 0.37, 0.43),
  });
  page.drawText("Documento oficial para consulta e referencia tecnica.", {
    x: PAGE.margin,
    y: 64,
    size: 11,
    font: fontRegular,
    color: rgb(0.18, 0.21, 0.28),
  });
}

function paginateToc(entries: TocEntry[]): TocEntry[][] {
  const pages: TocEntry[][] = [];
  let current: TocEntry[] = [];
  let used = 0;
  const max = PAGE.height - PAGE.margin * 2 - 40;
  for (const item of entries) {
    const lineHeight = item.level === 1 ? 20 : 16;
    if (used + lineHeight > max && current.length) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(item);
    used += lineHeight;
  }
  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
}

function drawTocPage(page: PDFPage, entries: TocEntry[], fontRegular: PDFFont, fontBold: PDFFont, pageIndex: number) {
  let y = PAGE.height - PAGE.margin;
  if (pageIndex === 0) {
    page.drawText("Sumario", {
      x: PAGE.margin,
      y: y - 20,
      size: 23,
      font: fontBold,
      color: rgb(0.043, 0.31, 0.541),
    });
    y -= 44;
  } else {
    page.drawText("Sumario (continua)", {
      x: PAGE.margin,
      y: y - 16,
      size: 15,
      font: fontBold,
      color: rgb(0.043, 0.31, 0.541),
    });
    y -= 34;
  }

  for (const item of entries) {
    const left = item.title;
    const right = String(item.pageNumber);
    const size = item.level === 1 ? 11 : 10;
    const font = item.level === 1 ? fontBold : fontRegular;
    const color = item.level === 1 ? rgb(0.1, 0.14, 0.2) : rgb(0.2, 0.24, 0.3);
    const indent = item.level === 1 ? 0 : 18;
    const rightWidth = fontRegular.widthOfTextAtSize(right, 10.5);
    const rightX = PAGE.width - PAGE.margin - rightWidth;
    const titleX = PAGE.margin + indent;
    const titleWidth = font.widthOfTextAtSize(left, size);
    const dotsArea = Math.max(24, rightX - titleX - titleWidth - 8);
    const dotW = fontRegular.widthOfTextAtSize(".", 10);
    const dots = ".".repeat(Math.max(6, Math.floor(dotsArea / dotW)));

    page.drawText(`${left} ${dots}`, {
      x: titleX,
      y: y - size,
      size,
      font,
      color,
      maxWidth: PAGE.width - PAGE.margin * 2 - rightWidth - indent - 12,
    });
    page.drawText(right, {
      x: rightX,
      y: y - 10.5,
      size: 10.5,
      font: fontRegular,
      color: rgb(0.16, 0.2, 0.27),
    });
    y -= item.level === 1 ? 20 : 16;
  }
}

export async function GET() {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Manual ITCD/PA - Manual Completo");
  pdf.setAuthor("SEFA/PA");
  pdf.setSubject("Manual consolidado");
  pdf.setCreator("Manual ITCD/PA");
  pdf.setProducer("Manual ITCD/PA");

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const coverPage = pdf.addPage([PAGE.width, PAGE.height]);
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.margin;

  let logo:
    | { width: number; height: number; draw: (opts: { x: number; y: number; width: number; height: number }) => void }
    | undefined;
  try {
    const logoPath = path.join(process.cwd(), "public", "sefa-pa-logo.png");
    const logoBytes = await fs.readFile(logoPath);
    const logoImage = await pdf.embedPng(logoBytes);
    logo = {
      width: logoImage.width,
      height: logoImage.height,
      draw: ({ x, y: drawY, width, height }) =>
        coverPage.drawImage(logoImage, { x, y: drawY, width, height }),
    };
  } catch {
    logo = undefined;
  }
  drawCover(coverPage, fontRegular, fontBold, logo);

  const slugs = getAllManualSlugs().filter(
    (slug) => slug.join("/") !== "estrutura-hibrida/manual-completo",
  );
  const tocEntries: TocEntry[] = [];

  ({ page, y } = drawTextBlock(
    pdf,
    page,
    y,
    "Conteudo consolidado",
    {
      font: fontBold,
      size: 16,
      lineHeight: 23,
      color: { r: 0.043, g: 0.31, b: 0.541 },
      gapAfter: 8,
    },
  ));

  for (const slug of slugs) {
    const manualDoc = await getDocBySlug(slug);
    if (!manualDoc) continue;

    const titleState = ensurePage(pdf, page, y, 56);
    page = titleState.page;
    y = titleState.y;

    const currentPageNum = pdf.getPages().indexOf(page) + 1;
    const baseLink = `${siteConfig.url}${manualHrefFromSlug(slug)}`;
    tocEntries.push({
      title: manualDoc.frontmatter.title,
      level: 1,
      pageNumber: currentPageNum,
      link: baseLink,
    });

    ({ page, y } = drawTextBlock(
      pdf,
      page,
      y,
      manualDoc.frontmatter.title,
      {
        font: fontBold,
        size: 17,
        lineHeight: 25,
        color: { r: 0.043, g: 0.31, b: 0.541 },
        gapAfter: 3,
      },
    ));

    ({ page, y } = drawTextBlock(
      pdf,
      page,
      y,
      manualDoc.frontmatter.description,
      {
        font: fontRegular,
        size: 11,
        lineHeight: 17,
        color: { r: 0.216, g: 0.255, b: 0.318 },
        gapAfter: 8,
      },
    ));

    const blocks = blocksFromHtml(manualDoc.contentHtml, manualDoc.frontmatter.title);
    for (const block of blocks) {
      if (block.type === "h2" || block.type === "h3") {
        tocEntries.push({
          title: block.text,
          level: 2,
          pageNumber: pdf.getPages().indexOf(page) + 1,
          link: `${baseLink}#${slugify(block.text)}`,
        });
      }
      const style = styleForBlock(block.type, fontRegular, fontBold);
      const text = block.type === "li" ? `• ${block.text}` : block.text;
      ({ page, y } = drawTextBlock(pdf, page, y, text, style));
    }

    y -= 6;
  }

  const tocPagesData = paginateToc(tocEntries);
  const tocOffset = tocPagesData.length;
  const adjustedToc = tocEntries.map((entry) => ({
    ...entry,
    pageNumber: entry.pageNumber + tocOffset,
  }));
  const adjustedPagesData = paginateToc(adjustedToc);

  for (let i = 0; i < adjustedPagesData.length; i += 1) {
    const tocPage = pdf.insertPage(1 + i, [PAGE.width, PAGE.height]);
    drawTocPage(tocPage, adjustedPagesData[i] ?? [], fontRegular, fontBold, i);
  }

  const allPages = pdf.getPages();
  for (let i = 0; i < allPages.length; i += 1) {
    if (i === 0) continue;
    drawPageFooter(allPages[i]!, `Pagina ${i + 1} de ${allPages.length}`, fontRegular);
  }

  const bytes = await pdf.save();
  const file = Buffer.from(bytes);

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="manual-itcd-pa-completo.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
