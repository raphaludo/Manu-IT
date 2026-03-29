import { listVisualPageSlugs } from "@/lib/visual-pages/store";
import { AdminPagesList } from "@/components/visual-editor/admin-pages-list";

export default async function AdminHomePage() {
  const slugs = await listVisualPageSlugs();
  return <AdminPagesList initialSlugs={slugs} />;
}
