import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-center font-serif text-2xl font-bold text-foreground">
        Página não encontrada
      </h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        O endereço pode ter sido alterado ou o conteúdo ainda não está
        disponível neste manual.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
