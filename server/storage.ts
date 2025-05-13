import { 
  users, 
  diaryEntries, 
  painSymptoms, 
  bloodPresence,
  type User, 
  type InsertUser, 
  type DiaryEntry,
  type InsertDiaryEntry,
  type PainSymptom,
  type InsertPainSymptom,
  type BloodPresence,
  type InsertBloodPresence,
  type DiaryEntryWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Diary entry operations
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  getDiaryEntryWithDetails(id: number): Promise<DiaryEntryWithDetails | undefined>;
  getDiaryEntriesByUserId(userId: number): Promise<DiaryEntry[]>;
  getDiaryEntryByUserAndDate(userId: number, date: Date): Promise<DiaryEntryWithDetails | undefined>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: number, entry: Partial<InsertDiaryEntry>): Promise<DiaryEntry | undefined>;
  deleteDiaryEntry(id: number): Promise<boolean>;
  
  // Pain symptom operations
  createPainSymptom(symptom: InsertPainSymptom): Promise<PainSymptom>;
  getPainSymptomsByDiaryEntryId(diaryEntryId: number): Promise<PainSymptom[]>;
  updatePainSymptom(id: number, symptom: Partial<InsertPainSymptom>): Promise<PainSymptom | undefined>;
  deletePainSymptom(id: number): Promise<boolean>;
  
  // Blood presence operations
  createBloodPresence(presence: InsertBloodPresence): Promise<BloodPresence>;
  getBloodPresenceByDiaryEntryId(diaryEntryId: number): Promise<BloodPresence | undefined>;
  updateBloodPresence(id: number, presence: Partial<InsertBloodPresence>): Promise<BloodPresence | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Diary entry operations
  async getDiaryEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return entry;
  }

  async getDiaryEntryWithDetails(id: number): Promise<DiaryEntryWithDetails | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    
    if (!entry) return undefined;
    
    const painList = await this.getPainSymptomsByDiaryEntryId(id);
    const bloodInfo = await this.getBloodPresenceByDiaryEntryId(id);
    
    return {
      ...entry,
      painSymptoms: painList,
      bloodPresence: bloodInfo || null,
    };
  }

  async getDiaryEntriesByUserId(userId: number): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.date));
  }

  async getDiaryEntryByUserAndDate(userId: number, date: Date): Promise<DiaryEntryWithDetails | undefined> {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(
        and(
          eq(diaryEntries.userId, userId),
          eq(diaryEntries.date, formattedDate)
        )
      );
    
    if (!entry) return undefined;
    
    const painList = await this.getPainSymptomsByDiaryEntryId(entry.id);
    const bloodInfo = await this.getBloodPresenceByDiaryEntryId(entry.id);
    
    return {
      ...entry,
      painSymptoms: painList,
      bloodPresence: bloodInfo || null,
    };
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

  // Pain symptom operations
  async createPainSymptom(symptom: InsertPainSymptom): Promise<PainSymptom> {
    const [painSymptom] = await db.insert(painSymptoms).values(symptom).returning();
    return painSymptom;
  }

  async getPainSymptomsByDiaryEntryId(diaryEntryId: number): Promise<PainSymptom[]> {
    return await db
      .select()
      .from(painSymptoms)
      .where(eq(painSymptoms.diaryEntryId, diaryEntryId));
  }

  async updatePainSymptom(id: number, symptom: Partial<InsertPainSymptom>): Promise<PainSymptom | undefined> {
    const [updatedSymptom] = await db
      .update(painSymptoms)
      .set(symptom)
      .where(eq(painSymptoms.id, id))
      .returning();
    return updatedSymptom;
  }

  async deletePainSymptom(id: number): Promise<boolean> {
    const [deletedSymptom] = await db
      .delete(painSymptoms)
      .where(eq(painSymptoms.id, id))
      .returning();
    return !!deletedSymptom;
  }

  // Blood presence operations
  async createBloodPresence(presence: InsertBloodPresence): Promise<BloodPresence> {
    const [bloodRecord] = await db.insert(bloodPresence).values(presence).returning();
    return bloodRecord;
  }

  async getBloodPresenceByDiaryEntryId(diaryEntryId: number): Promise<BloodPresence | undefined> {
    const [bloodRecord] = await db
      .select()
      .from(bloodPresence)
      .where(eq(bloodPresence.diaryEntryId, diaryEntryId));
    return bloodRecord;
  }

  async updateBloodPresence(id: number, presence: Partial<InsertBloodPresence>): Promise<BloodPresence | undefined> {
    const [updatedPresence] = await db
      .update(bloodPresence)
      .set(presence)
      .where(eq(bloodPresence.id, id))
      .returning();
    return updatedPresence;
  }
}

export const storage = new DatabaseStorage();
