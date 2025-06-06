import { 
  users, 
  diaryEntries,
  type User, 
  type InsertUser, 
  type DiaryEntry,
  type InsertDiaryEntry,
  medicalInfo,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "./db";

// Function to update measurements
export async function updateMeasurements(
  userId: number,
  date: Date,
  measurements: {
    waterIntake?: number;
    weight?: number;
    basalTemperature?: number;
  }
) {
  return await db
    .update(diaryEntries)
    .set(measurements)
    .where(
      and(
        eq(diaryEntries.userId, userId),
        eq(diaryEntries.date, date)
      )
    )
    .returning();
}

// Function to get measurements history
export async function getMeasurementsHistory(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  return await db
    .select({
      date: diaryEntries.date,
      waterIntake: diaryEntries.waterIntake,
      weight: diaryEntries.weight,
      basalTemperature: diaryEntries.basalTemperature,
    })
    .from(diaryEntries)
    .where(
      and(
        eq(diaryEntries.userId, userId),
        diaryEntries.date.gte(startDate),
        diaryEntries.date.lte(endDate)
      )
    )
    .orderBy(desc(diaryEntries.date));
}

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
    try {
      console.log("Updating diary entry with:", { id, entry });
      const [updatedEntry] = await db
        .update(diaryEntries)
        .set({
          ...entry,
          medicines: entry.medicines !== undefined ? entry.medicines : undefined,
          visits: entry.visits !== undefined ? entry.visits : undefined
        })
        .where(eq(diaryEntries.id, id))
        .returning();
      console.log("Updated entry:", updatedEntry);
      return updatedEntry;
    } catch (err) {
      console.error("Error updating diary entry:", err);
      throw new Error("Failed to update diary entry");
    }
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

  // Fetch all entries for a specific user
  async getDiaryEntriesByUserId(userId: number) {
    try {
      return await db
        .select()
        .from(diaryEntries)
        .where(eq(diaryEntries.userId, userId))
        .orderBy(desc(diaryEntries.date));
    } catch (err) {
      console.error("Error fetching diary entries by user ID:", err);
      throw new Error("Failed to fetch diary entries");
    }
  }

  // Medical Info Operations
  async getMedicalInfoByUserId(userId: number) {
    try {
      const results = await db
        .select()
        .from(medicalInfo)
        .where(eq(medicalInfo.userId, userId))
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.error("Error fetching medical info by user ID:", err);
      throw new Error("Failed to fetch medical info");
    }
  }

  async createMedicalInfo(data: any) {
    try {
      const insertedIds = await db
        .insert(medicalInfo)
        .values(data)
        .returning({ id: medicalInfo.id });

      if (insertedIds.length === 0) {
        throw new Error("Failed to insert medical info");
      }

      return await this.getMedicalInfoById(insertedIds[0].id);
    } catch (err) {
      console.error("Error creating medical info:", err);
      throw new Error("Failed to create medical info");
    }
  }

  async getMedicalInfoById(id: number) {
    try {
      const results = await db
        .select()
        .from(medicalInfo)
        .where(eq(medicalInfo.id, id))
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.error("Error fetching medical info by ID:", err);
      throw new Error("Failed to fetch medical info");
    }
  }

  async updateMedicalInfo(id: number, data: any) {
    try {
      await db
        .update(medicalInfo)
        .set(data)
        .where(eq(medicalInfo.id, id));

      return await this.getMedicalInfoById(id);
    } catch (err) {
      console.error("Error updating medical info:", err);
      throw new Error("Failed to update medical info");
    }
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