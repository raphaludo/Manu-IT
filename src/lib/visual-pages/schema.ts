import { z } from "zod";

export const calloutVariantSchema = z.enum([
  "info",
  "warning",
  "success",
  "note",
  "legal",
]);

export const richTextBlockSchema = z.object({
  id: z.string(),
  type: z.literal("richText"),
  html: z.string(),
});

export const imageBlockSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  src: z.string().min(1),
  alt: z.string().default(""),
  caption: z.string().optional(),
  width: z.enum(["normal", "wide", "full"]).default("normal"),
});

export const calloutBlockSchema = z.object({
  id: z.string(),
  type: z.literal("callout"),
  variant: calloutVariantSchema,
  title: z.string().optional(),
  html: z.string(),
});

export const dividerBlockSchema = z.object({
  id: z.string(),
  type: z.literal("divider"),
});

export const spacerBlockSchema = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export const quoteBlockSchema = z.object({
  id: z.string(),
  type: z.literal("quote"),
  html: z.string(),
  attribution: z.string().optional(),
});

export const buttonItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

export const buttonsBlockSchema = z.object({
  id: z.string(),
  type: z.literal("buttons"),
  items: z.array(buttonItemSchema).min(1).max(4),
});

export const visualBlockSchema = z.discriminatedUnion("type", [
  richTextBlockSchema,
  imageBlockSchema,
  calloutBlockSchema,
  dividerBlockSchema,
  spacerBlockSchema,
  quoteBlockSchema,
  buttonsBlockSchema,
]);

export const visualPageSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: apenas minúsculas, números e hífen"),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  blocks: z.array(visualBlockSchema),
  updatedAt: z.string(),
});

export type VisualBlock = z.infer<typeof visualBlockSchema>;
export type VisualPage = z.infer<typeof visualPageSchema>;
export type CalloutVariant = z.infer<typeof calloutVariantSchema>;
