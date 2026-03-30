import PDFDocument from "pdfkit";
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

function renderWrappedText(
  doc: PDFKit.PDFDocument,
  text: string,
  options?: PDFKit.Mixins.TextOptions,
) {
  const content = text.trim();
  if (!content) return;
  doc.text(content, options);
}

export async function GET() {
  const pdf = new PDFDocument({
    margin: 56,
    size: "A4",
    info: {
      Title: "Manual ITCD/PA - Manual Completo",
      Author: "SEFA/PA",
      Subject: "Manual consolidado",
    },
  });

  const chunks: Buffer[] = [];
  pdf.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const slugs = getAllManualSlugs().filter(
    (slug) => slug.join("/") !== "estrutura-hibrida/manual-completo",
  );

  pdf.fontSize(18).fillColor("#0b4f8a").text("Manual ITCD/PA", {
    align: "left",
  });
  pdf.moveDown(0.25);
  pdf.fontSize(12).fillColor("#1f2937").text("Versão consolidada em PDF", {
    align: "left",
  });
  pdf.moveDown(0.5);
  pdf
    .fontSize(10)
    .fillColor("#4b5563")
    .text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
  pdf.moveDown(1.2);

  for (const slug of slugs) {
    const manualDoc = await getDocBySlug(slug);
    if (!manualDoc) continue;

    if (pdf.y > 660) pdf.addPage();

    pdf.fontSize(15).fillColor("#0b4f8a");
    renderWrappedText(pdf, manualDoc.frontmatter.title, {
      align: "left",
      underline: false,
    });

    pdf.moveDown(0.3);
    pdf.fontSize(11).fillColor("#374151");
    renderWrappedText(pdf, manualDoc.frontmatter.description, {
      align: "left",
    });
    pdf.moveDown(0.45);

    const plainText = structuredPlainText(manualDoc.contentHtml);
    pdf.fontSize(11).fillColor("#111827");
    renderWrappedText(pdf, plainText, {
      align: "justify",
      lineGap: 2,
    });
    pdf.moveDown(1);
  }

  pdf.end();

  await new Promise<void>((resolve) => pdf.on("end", resolve));
  const file = Buffer.concat(chunks);

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="manual-itcd-pa-completo.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
