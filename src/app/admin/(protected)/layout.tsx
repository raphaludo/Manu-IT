import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/visual-pages/auth";
import { AdminChrome } from "@/components/visual-editor/admin-chrome";

const COOKIE = "visual_admin";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const secret = process.env.CONTENT_ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!verifyAdminSession(secret, token)) {
    redirect("/admin/login");
  }
  return <AdminChrome>{children}</AdminChrome>;
}
