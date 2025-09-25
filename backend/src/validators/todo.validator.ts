import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  userId: z.number(),
  priority: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  priority: z.string().optional(),
});

export const updatePartialTodoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.string().optional(),
});
