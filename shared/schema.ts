import { pgTable, text, serial, integer, boolean, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Moods enum
export const moodEnum = pgEnum("mood", ["sad", "neutral", "happy"]);

// Flow enum
export const flowEnum = pgEnum("flow", ["none", "light", "medium", "heavy", "clots"]);

// Diary entries table
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mood: moodEnum("mood"),
  flow: flowEnum("flow"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pain symptoms table
export const painSymptoms = pgTable("pain_symptoms", {
  id: serial("id").primaryKey(),
  diaryEntryId: integer("diary_entry_id").notNull().references(() => diaryEntries.id, { onDelete: "cascade" }),
  location: text("location").notNull(),
  intensity: integer("intensity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blood presence table
export const bloodPresence = pgTable("blood_presence", {
  id: serial("id").primaryKey(),
  diaryEntryId: integer("diary_entry_id").notNull().references(() => diaryEntries.id, { onDelete: "cascade" }),
  inFeces: boolean("in_feces").default(false).notNull(),
  inUrine: boolean("in_urine").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  diaryEntries: many(diaryEntries),
}));

export const diaryEntryRelations = relations(diaryEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
  }),
  painSymptoms: many(painSymptoms),
  bloodPresence: many(bloodPresence),
}));

export const painSymptomRelations = relations(painSymptoms, ({ one }) => ({
  diaryEntry: one(diaryEntries, {
    fields: [painSymptoms.diaryEntryId],
    references: [diaryEntries.id],
  }),
}));

export const bloodPresenceRelations = relations(bloodPresence, ({ one }) => ({
  diaryEntry: one(diaryEntries, {
    fields: [bloodPresence.diaryEntryId],
    references: [diaryEntries.id],
  }),
}));

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
});

export const insertPainSymptomSchema = createInsertSchema(painSymptoms).omit({
  id: true,
  createdAt: true,
});

export const insertBloodPresenceSchema = createInsertSchema(bloodPresence).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;

export type InsertPainSymptom = z.infer<typeof insertPainSymptomSchema>;
export type PainSymptom = typeof painSymptoms.$inferSelect;

export type InsertBloodPresence = z.infer<typeof insertBloodPresenceSchema>;
export type BloodPresence = typeof bloodPresence.$inferSelect;

// Pain location types
export const painLocations = [
  "abdominal",
  "pelvic",
  "dysmenorrhea",
  "defecation",
  "urination",
  "sexualIntercourse",
  "postSexual",
] as const;

export type PainLocation = typeof painLocations[number];

// DTO for diary entries with associated data
export type DiaryEntryWithDetails = DiaryEntry & {
  painSymptoms: PainSymptom[];
  bloodPresence: BloodPresence | null;
};
