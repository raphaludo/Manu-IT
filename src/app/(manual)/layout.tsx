import { ManualHeader } from "@/components/manual/manual-header";
import { ManualSidebar } from "@/components/manual/manual-sidebar";
import { SiteFooter } from "@/components/manual/site-footer";

export default function ManualLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ManualHeader />
      <div className="flex flex-1">
        <aside className="sticky top-14 z-30 hidden h-[calc(100dvh-3.5rem)] w-[17.5rem] shrink-0 self-start overflow-hidden sm:top-16 sm:h-[calc(100dvh-4rem)] lg:flex lg:flex-col">
          <ManualSidebar className="h-full" />
        </aside>
        <main className="relative min-w-0 flex-1 bg-gradient-to-b from-muted/25 via-background to-background dark:from-muted/10">
          <div className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)]">
            {children}
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
