import { 
  users, 
  diaryEntries,
  type User, 
  type InsertUser, 
  type DiaryEntry,
  type InsertDiaryEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "./db";

const PgStore = PgSession(session);

export class Storage {
  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Diary entry operations
  async getDiaryEntryByUserAndDate(userId: number, date: Date): Promise<DiaryEntry | undefined> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);

    // Format the date as ISO string (yyyy-mm-dd) for proper comparison
    const dateStr = formattedDate.toISOString().split('T')[0];

    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(
        and(
          eq(diaryEntries.userId, userId),
          eq(diaryEntries.date, dateStr)
        )
      );

    return entry;
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    const [diaryEntry] = await db.insert(diaryEntries).values(entry).returning();
    return diaryEntry;
  }

  async updateDiaryEntry(id: number, entry: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined> {
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set(entry)
      .where(eq(diaryEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteDiaryEntry(id: number): Promise<boolean> {
    const [deletedEntry] = await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id))
      .returning();
    return !!deletedEntry;
  }

  async getDiaryEntryById(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return entry;
  }

  async getDiaryEntriesByUserId(userId: number): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  // Session store
  getSessionStore(secret: string) {
    return new PgStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
      secret,
    });
  }
}

export const storage = new Storage();