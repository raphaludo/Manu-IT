import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getDocBySlug } from "@/lib/manual/get-doc";
import { getAllManualSlugs } from "@/lib/manual/manifest";
import { plainTextFromHtml } from "@/lib/manual/html-text";

export const runtime = "nodejs";

function structuredPlainText(html: string): string {
  const withBreaks = html
    .replace(/<\/(h1|h2|h3|h4|h5|h6)>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");
  return plainTextFromHtml(withBreaks);
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

function drawParagraph(
  pdf: PDFDocument,
  currentPage: PDFPage,
  y: number,
  text: string,
  font: PDFFont,
  size: number,
  color: { r: number; g: number; b: number },
  lineHeight = size * 1.45,
): { page: PDFPage; y: number } {
  const maxWidth = PAGE.width - PAGE.margin * 2;
  const lines = splitLines(text).flatMap((line) => wrapLine(line, font, size, maxWidth));
  let page = currentPage;
  let cursorY = y;

  for (const line of lines) {
    const pageState = ensurePage(pdf, page, cursorY, lineHeight);
    page = pageState.page;
    cursorY = pageState.y;
    page.drawText(line || " ", {
      x: PAGE.margin,
      y: cursorY - size,
      size,
      font,
      color: rgb(color.r, color.g, color.b),
    });
    cursorY -= lineHeight;
  }

  return { page, y: cursorY };
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
  let page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.margin;

  const slugs = getAllManualSlugs().filter(
    (slug) => slug.join("/") !== "estrutura-hibrida/manual-completo",
  );

  ({ page, y } = drawParagraph(
    pdf,
    page,
    y,
    "Manual ITCD/PA",
    fontBold,
    18,
    { r: 0.043, g: 0.31, b: 0.541 },
  ));
  ({ page, y } = drawParagraph(
    pdf,
    page,
    y - 2,
    "Versao consolidada em PDF",
    fontRegular,
    12,
    { r: 0.122, g: 0.161, b: 0.216 },
  ));
  ({ page, y } = drawParagraph(
    pdf,
    page,
    y - 3,
    `Gerado em ${new Date().toLocaleString("pt-BR")}`,
    fontRegular,
    10,
    { r: 0.294, g: 0.333, b: 0.388 },
  ));
  y -= 8;

  for (const slug of slugs) {
    const manualDoc = await getDocBySlug(slug);
    if (!manualDoc) continue;

    const titleState = ensurePage(pdf, page, y, 48);
    page = titleState.page;
    y = titleState.y;

    ({ page, y } = drawParagraph(
      pdf,
      page,
      y,
      manualDoc.frontmatter.title,
      fontBold,
      15,
      { r: 0.043, g: 0.31, b: 0.541 },
    ));

    ({ page, y } = drawParagraph(
      pdf,
      page,
      y - 1,
      manualDoc.frontmatter.description,
      fontRegular,
      11,
      { r: 0.216, g: 0.255, b: 0.318 },
    ));

    const plainText = structuredPlainText(manualDoc.contentHtml);
    ({ page, y } = drawParagraph(
      pdf,
      page,
      y - 4,
      plainText,
      fontRegular,
      10.5,
      { r: 0.067, g: 0.094, b: 0.153 },
      16,
    ));
    y -= 10;
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
