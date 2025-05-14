
import { pgTable, text, serial, integer, boolean, date, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
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

// Pregnancy test enum
export const pregnancyTestEnum = pgEnum("pregnancy_test", ["none", "positive", "negative", "unclear"]);

// Unified diary entries table
export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mood: moodEnum("mood"),
  flow: flowEnum("flow"),
  notes: text("notes"),
  
  // Pain symptoms data (stored as JSON)
  painSymptoms: jsonb("pain_symptoms").$type<Array<{
    location: string;
    intensity: number;
  }>>().default([]),
  
  // Blood presence data
  bloodInFeces: boolean("blood_in_feces").default(false),
  bloodInUrine: boolean("blood_in_urine").default(false),
  
  // Additional info data
  pregnancyTest: pregnancyTestEnum("pregnancy_test").default("none"),
  physicalActivities: jsonb("physical_activities").$type<string[]>().default([]),
  medicines: jsonb("medicines").$type<Array<{
    name: string;
    dosage: string;
  }>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  diaryEntries: many(diaryEntries),
}));

export const diaryEntryRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;

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

// Physical activity types
export const physicalActivities = [
  "none", 
  "yoga", 
  "walking", 
  "running", 
  "swimming", 
  "cycling", 
  "gym", 
  "dance", 
  "other"
] as const;

export type PhysicalActivityType = typeof physicalActivities[number];

// Pregnancy test types
export type PregnancyTestType = "none" | "positive" | "negative" | "unclear";

// Medicine type
export type Medicine = {
  name: string;
  dosage: string;
};
