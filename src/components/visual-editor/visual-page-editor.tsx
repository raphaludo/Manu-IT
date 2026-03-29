"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import {
  GripVertical,
  Trash2,
  Type,
  ImageIcon,
  Megaphone,
  Minus,
  MoveVertical,
  Quote,
  MousePointerClick,
  Plus,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { TiptapEditor } from "@/components/visual-editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  VisualBlock,
  VisualPage,
  CalloutVariant,
} from "@/lib/visual-pages/schema";
import { savePageAction } from "@/app/actions/visual-pages";
import Link from "next/link";

function createBlock(type: VisualBlock["type"]): VisualBlock {
  const id = nanoid();
  switch (type) {
    case "richText":
      return {
        id,
        type: "richText",
        html: "<p>Texto formatado. Use a barra de ferramentas acima do campo.</p>",
      };
    case "image":
      return { id, type: "image", src: "", alt: "", width: "normal" };
    case "callout":
      return {
        id,
        type: "callout",
        variant: "info",
        title: "Destaque",
        html: "<p>Mensagem importante para o leitor.</p>",
      };
    case "divider":
      return { id, type: "divider" };
    case "spacer":
      return { id, type: "spacer", size: "md" };
    case "quote":
      return {
        id,
        type: "quote",
        html: "<p>Citação ou trecho normativo.</p>",
        attribution: "",
      };
    case "buttons":
      return {
        id,
        type: "buttons",
        items: [
          { label: "Saiba mais", href: "/", variant: "primary" },
        ],
      };
    default:
      return { id, type: "richText", html: "<p></p>" };
  }
}

const ADD_MENU: { type: VisualBlock["type"]; label: string; icon: typeof Type }[] =
  [
    { type: "richText", label: "Texto rico", icon: Type },
    { type: "image", label: "Imagem", icon: ImageIcon },
    { type: "callout", label: "Destaque / alerta", icon: Megaphone },
    { type: "quote", label: "Citação", icon: Quote },
    { type: "buttons", label: "Botões (CTA)", icon: MousePointerClick },
    { type: "divider", label: "Divisor", icon: Minus },
    { type: "spacer", label: "Espaço vertical", icon: MoveVertical },
  ];

function SortableBlock({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          className="flex w-9 shrink-0 cursor-grab items-center justify-center rounded-l-xl border-r border-border bg-muted/40 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Arrastar bloco"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: VisualBlock;
  onChange: (b: VisualBlock) => void;
  onRemove: () => void;
}) {
  const label =
    ADD_MENU.find((m) => m.type === block.type)?.label ?? "Bloco";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
          aria-label="Remover bloco"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {block.type === "richText" ? (
        <TiptapEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
        />
      ) : null}

      {block.type === "image" ? (
        <div className="space-y-3">
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              URL da imagem
            </label>
            <Input
              className="mt-1"
              value={block.src}
              onChange={(e) => onChange({ ...block, src: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Texto alternativo (acessibilidade)
            </label>
            <Input
              className="mt-1"
              value={block.alt}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
            />
          </div>
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Legenda (opcional)
            </label>
            <Input
              className="mt-1"
              value={block.caption ?? ""}
              onChange={(e) =>
                onChange({ ...block, caption: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Largura
            </label>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={block.width}
              onChange={(e) =>
                onChange({
                  ...block,
                  width: e.target.value as "normal" | "wide" | "full",
                })
              }
            >
              <option value="normal">Conteúdo</option>
              <option value="wide">Ampla</option>
              <option value="full">Tela cheia</option>
            </select>
          </div>
        </div>
      ) : null}

      {block.type === "callout" ? (
        <div className="space-y-3">
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Tipo de destaque
            </label>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={block.variant}
              onChange={(e) =>
                onChange({
                  ...block,
                  variant: e.target.value as CalloutVariant,
                })
              }
            >
              <option value="info">Informação</option>
              <option value="warning">Atenção / alerta</option>
              <option value="success">Sucesso / confirmação</option>
              <option value="note">Nota neutra</option>
              <option value="legal">Destaque normativo</option>
            </select>
          </div>
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Título (opcional)
            </label>
            <Input
              className="mt-1"
              value={block.title ?? ""}
              onChange={(e) =>
                onChange({ ...block, title: e.target.value || undefined })
              }
            />
          </div>
          <TiptapEditor
            value={block.html}
            onChange={(html) => onChange({ ...block, html })}
            minHeight="min-h-[100px]"
          />
        </div>
      ) : null}

      {block.type === "quote" ? (
        <div className="space-y-3">
          <TiptapEditor
            value={block.html}
            onChange={(html) => onChange({ ...block, html })}
          />
          <div>
            <label className="text-2xs font-medium text-muted-foreground">
              Autoria / fonte (opcional)
            </label>
            <Input
              className="mt-1"
              value={block.attribution ?? ""}
              onChange={(e) =>
                onChange({
                  ...block,
                  attribution: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>
      ) : null}

      {block.type === "buttons" ? (
        <div className="space-y-3">
          {block.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-border/60 p-3"
            >
              <div className="min-w-[120px] flex-1">
                <label className="text-2xs text-muted-foreground">Rótulo</label>
                <Input
                  className="mt-1"
                  value={item.label}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...item, label: e.target.value };
                    onChange({ ...block, items });
                  }}
                />
              </div>
              <div className="min-w-[160px] flex-[2]">
                <label className="text-2xs text-muted-foreground">Link</label>
                <Input
                  className="mt-1"
                  value={item.href}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[idx] = { ...item, href: e.target.value };
                    onChange({ ...block, items });
                  }}
                />
              </div>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={item.variant}
                onChange={(e) => {
                  const items = [...block.items];
                  items[idx] = {
                    ...item,
                    variant: e.target.value as "primary" | "secondary" | "outline",
                  };
                  onChange({ ...block, items });
                }}
              >
                <option value="primary">Primário</option>
                <option value="secondary">Secundário</option>
                <option value="outline">Contorno</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={block.items.length <= 1}
                onClick={() => {
                  const items = block.items.filter((_, i) => i !== idx);
                  onChange({ ...block, items });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {block.items.length < 4 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  ...block,
                  items: [
                    ...block.items,
                    {
                      label: "Novo link",
                      href: "/",
                      variant: "outline" as const,
                    },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar botão
            </Button>
          ) : null}
        </div>
      ) : null}

      {block.type === "divider" ? (
        <p className="text-sm text-muted-foreground">
          Linha divisória entre seções (visual limpo na página pública).
        </p>
      ) : null}

      {block.type === "spacer" ? (
        <div>
          <label className="text-2xs font-medium text-muted-foreground">
            Altura do espaço
          </label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={block.size}
            onChange={(e) =>
              onChange({
                ...block,
                size: e.target.value as "sm" | "md" | "lg",
              })
            }
          >
            <option value="sm">Pequeno</option>
            <option value="md">Médio</option>
            <option value="lg">Grande</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}

export function VisualPageEditor({ initial }: { initial: VisualPage }) {
  const [page, setPage] = React.useState<VisualPage>(initial);
  const [saving, setSaving] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = page.blocks.findIndex((b) => b.id === active.id);
    const newIndex = page.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setPage({
      ...page,
      blocks: arrayMove(page.blocks, oldIndex, newIndex),
    });
  };

  const updateBlock = (id: string, b: VisualBlock) => {
    setPage({
      ...page,
      blocks: page.blocks.map((x) => (x.id === id ? b : x)),
    });
  };

  const removeBlock = (id: string) => {
    setPage({ ...page, blocks: page.blocks.filter((x) => x.id !== id) });
  };

  const addBlock = (type: VisualBlock["type"]) => {
    setPage({ ...page, blocks: [...page.blocks, createBlock(type)] });
    setPaletteOpen(false);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res = await savePageAction(page);
    setSaving(false);
    if (res.ok) {
      setMessage({ type: "ok", text: "Alterações salvas." });
      setPage((p) => ({ ...p, updatedAt: new Date().toISOString() }));
    } else {
      setMessage({ type: "err", text: res.error ?? "Erro ao salvar." });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <Input
              className="h-9 border-transparent bg-transparent text-lg font-semibold shadow-none focus-visible:ring-1"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
            />
            <Input
              className="mt-1 h-8 border-transparent bg-transparent text-sm text-muted-foreground shadow-none"
              placeholder="Descrição / subtítulo (opcional)"
              value={page.description}
              onChange={(e) =>
                setPage({ ...page, description: e.target.value })
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/paginas/${page.slug}`} target="_blank">
                <ExternalLink className="mr-1 h-4 w-4" />
                Ver página
              </Link>
            </Button>
            <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Inserir bloco
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,20rem)]">
                <SheetHeader>
                  <SheetTitle>Blocos</SheetTitle>
                </SheetHeader>
                <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
                  <div className="space-y-1 pr-3">
                    {ADD_MENU.map((item) => (
                      <Button
                        key={item.type}
                        variant="ghost"
                        className="h-auto w-full justify-start gap-3 py-3"
                        type="button"
                        onClick={() => addBlock(item.type)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>
        {message ? (
          <div
            className={cn(
              "border-t px-4 py-2 text-center text-sm sm:px-6",
              message.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {message.text}
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="mb-6 text-2xs text-muted-foreground">
          Slug:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {page.slug}
          </code>{" "}
          · Arraste os blocos pelo ícone à esquerda para reordenar.
        </p>

        {page.blocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Nenhum bloco ainda</p>
            <p className="mt-2 text-sm">
              Use &quot;Inserir bloco&quot; para adicionar texto, imagens e
              destaques.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={page.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {page.blocks.map((block) => (
                  <SortableBlock key={block.id} id={block.id}>
                    <BlockEditor
                      block={block}
                      onChange={(b) => updateBlock(block.id, b)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  </SortableBlock>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
