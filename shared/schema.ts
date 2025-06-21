import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const extractionJobs = pgTable("extraction_jobs", {
  id: serial("id").primaryKey(),
  postUrl: text("post_url").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  commentCount: integer("comment_count"),
  jsonData: jsonb("json_data"),
  textData: text("text_data"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExtractionJobSchema = createInsertSchema(extractionJobs).pick({
  postUrl: true,
});

export const redditCredentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  username: z.string().min(1, "Username is required"),
});

export const extractCommentsSchema = z.object({
  postUrl: z.string().url("Must be a valid URL").refine(
    (url) => url.includes("reddit.com/r/") && url.includes("/comments/"),
    "Must be a valid Reddit post URL"
  ),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  username: z.string().min(1, "Username is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExtractionJob = z.infer<typeof insertExtractionJobSchema>;
export type ExtractionJob = typeof extractionJobs.$inferSelect;
export type RedditCredentials = z.infer<typeof redditCredentialsSchema>;
export type ExtractCommentsRequest = z.infer<typeof extractCommentsSchema>;
