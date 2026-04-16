import { pgTable, text, serial, jsonb, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mappingSessionsTable = pgTable("mapping_sessions", {
  id: serial("id").primaryKey(),
  erpSystemId: text("erp_system_id").notNull(),
  erpSystemName: text("erp_system_name").notNull(),
  documentType: text("document_type").notNull(),
  erpFields: jsonb("erp_fields").notNull(),
  mappings: jsonb("mappings").notNull(),
  stats: jsonb("stats").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMappingSessionSchema = createInsertSchema(mappingSessionsTable).omit({ id: true, createdAt: true });
export type InsertMappingSession = z.infer<typeof insertMappingSessionSchema>;
export type MappingSessionRow = typeof mappingSessionsTable.$inferSelect;
