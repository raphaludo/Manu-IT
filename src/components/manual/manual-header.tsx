"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ManualSidebar } from "@/components/manual/manual-sidebar";
import { SearchDialog } from "@/components/manual/search-dialog";
import { ThemeToggle } from "@/components/manual/theme-toggle";
import { siteConfig } from "@/config/site";

export function ManualHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-gradient-to-r from-background via-background to-secondary/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-[100vw] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,18rem)] border-sidebar-border p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navegação do manual</SheetTitle>
            </SheetHeader>
            <ManualSidebar className="h-full border-0" variant="drawer" />
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="group flex min-w-0 shrink-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2"
        >
          <span className="truncate text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
            {siteConfig.shortName}
          </span>
          <span className="hidden text-2xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:inline sm:text-[11px]">
            Documentação
          </span>
        </Link>

        <div className="mx-auto hidden min-w-0 max-w-md flex-1 px-2 md:block lg:max-w-lg lg:px-6">
          <SearchDialog />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="md:hidden">
            <SearchDialog compact />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
