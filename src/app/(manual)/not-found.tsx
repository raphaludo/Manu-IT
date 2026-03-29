import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ManualNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Página não encontrada
      </h1>
      <p className="text-sm text-muted-foreground">
        Este trecho do manual não existe ou foi movido. Verifique o endereço
        ou use a busca.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
