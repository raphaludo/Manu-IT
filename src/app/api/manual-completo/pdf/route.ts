import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getDocBySlug } from "@/lib/manual/get-doc";
import { getAllManualSlugs } from "@/lib/manual/manifest";
import { plainTextFromHtml } from "@/lib/manual/html-text";

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
  const tocPage = pdf.addPage([PAGE.width, PAGE.height]);
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.margin;

  const slugs = getAllManualSlugs().filter(
    (slug) => slug.join("/") !== "estrutura-hibrida/manual-completo",
  );

  // Capa
  coverPage.drawRectangle({
    x: 0,
    y: PAGE.height - 220,
    width: PAGE.width,
    height: 220,
    color: rgb(0.043, 0.31, 0.541),
  });
  coverPage.drawText("MANUAL ITCD/PA", {
    x: PAGE.margin,
    y: PAGE.height - 95,
    size: 28,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  coverPage.drawText("Versao consolidada", {
    x: PAGE.margin,
    y: PAGE.height - 130,
    size: 14,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });
  coverPage.drawText(`Gerado em ${new Date().toLocaleString("pt-BR")}`, {
    x: PAGE.margin,
    y: PAGE.height - 170,
    size: 10,
    font: fontRegular,
    color: rgb(0.88, 0.92, 0.97),
  });
  drawPageFooter(coverPage, "Secretaria de Estado da Fazenda do Para", fontRegular);

  type TocEntry = { title: string; pageNumber: number };
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

    tocEntries.push({
      title: manualDoc.frontmatter.title,
      pageNumber: pdf.getPages().indexOf(page) + 1,
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
      const style = styleForBlock(block.type, fontRegular, fontBold);
      const text = block.type === "li" ? `• ${block.text}` : block.text;
      ({ page, y } = drawTextBlock(pdf, page, y, text, style));
    }

    y -= 6;
  }

  // Sumario
  let tocY = PAGE.height - PAGE.margin;
  tocPage.drawText("Sumario", {
    x: PAGE.margin,
    y: tocY - 18,
    size: 22,
    font: fontBold,
    color: rgb(0.043, 0.31, 0.541),
  });
  tocY -= 44;

  for (const item of tocEntries) {
    const left = item.title;
    const right = String(item.pageNumber);
    const rightWidth = fontRegular.widthOfTextAtSize(right, 11);
    const rightX = PAGE.width - PAGE.margin - rightWidth;
    const dotsWidth = Math.max(20, rightX - PAGE.margin - fontRegular.widthOfTextAtSize(left, 11) - 8);
    const dotCount = Math.floor(dotsWidth / fontRegular.widthOfTextAtSize(".", 11));
    const dots = ".".repeat(Math.max(8, dotCount));

    tocPage.drawText(`${left} ${dots}`, {
      x: PAGE.margin,
      y: tocY - 11,
      size: 11,
      font: fontRegular,
      color: rgb(0.122, 0.161, 0.216),
      maxWidth: PAGE.width - PAGE.margin * 2 - rightWidth - 12,
    });
    tocPage.drawText(right, {
      x: rightX,
      y: tocY - 11,
      size: 11,
      font: fontRegular,
      color: rgb(0.122, 0.161, 0.216),
    });
    tocY -= 20;
  }

  const allPages = pdf.getPages();
  for (let i = 1; i < allPages.length; i += 1) {
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
