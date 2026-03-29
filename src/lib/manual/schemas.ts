import { z } from "zod";

export const docCategorySchema = z.enum([
  "leis",
  "decretos",
  "instrucoes-normativas",
  "procedimentos",
  "exemplos",
  "faq",
]);

export const docFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: docCategorySchema,
  updated: z.string().optional(),
  order: z.number().optional(),
  draft: z.boolean().optional().default(false),
});

export type DocFrontmatter = z.infer<typeof docFrontmatterSchema>;
