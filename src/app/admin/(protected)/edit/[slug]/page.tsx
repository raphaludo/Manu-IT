import { notFound } from "next/navigation";
import { getVisualPage } from "@/lib/visual-pages/store";
import { VisualPageEditor } from "@/components/visual-editor/visual-page-editor";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminEditPage({ params }: Props) {
  const { slug } = await params;
  const page = await getVisualPage(slug);
  if (!page) notFound();
  return <VisualPageEditor initial={page} />;
}
