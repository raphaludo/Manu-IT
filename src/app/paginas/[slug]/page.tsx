import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisualPageRenderer } from "@/components/visual-editor/page-renderer";
import {
  getVisualPage,
  listVisualPageSlugs,
} from "@/lib/visual-pages/store";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listVisualPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getVisualPage(slug);
  if (!page) return { title: "Não encontrado" };
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    title: page.title,
    description: page.description || undefined,
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      url: `${base}/paginas/${slug}`,
      type: "article",
    },
  };
}

export default async function PaginaVisualPublica({ params }: Props) {
  const { slug } = await params;
  const page = await getVisualPage(slug);
  if (!page) notFound();
  return <VisualPageRenderer page={page} />;
}
