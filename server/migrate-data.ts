
import { db } from "./db";
import { diaryEntries as newDiaryEntries } from "@shared/schema";
import { sql } from "drizzle-orm";

async function migrateData() {
  console.log("Starting data migration to unified schema...");

  try {
    // Ottieni tutte le voci del diario esistenti
    const oldEntries = await db.execute(sql`
      SELECT 
        d.id, 
        d.user_id, 
        d.date, 
        d.mood, 
        d.flow, 
        d.notes, 
        d.created_at
      FROM diary_entries d
    `);

    console.log(`Found ${oldEntries.rows.length} diary entries to migrate.`);

    // Per ogni voce, ottieni i sintomi del dolore e la presenza di sangue associati
    for (const entry of oldEntries.rows) {
      const entryId = entry.id;
      
      // Ottieni i sintomi del dolore
      const painSymptoms = await db.execute(sql`
        SELECT location, intensity
        FROM pain_symptoms
        WHERE diary_entry_id = ${entryId}
      `);
      
      // Ottieni la presenza di sangue
      const bloodPresence = await db.execute(sql`
        SELECT in_feces, in_urine
        FROM blood_presence
        WHERE diary_entry_id = ${entryId}
      `);
      
      // Inserisci nella nuova tabella unificata
      await db.insert(newDiaryEntries).values({
        id: entryId,
        userId: entry.user_id,
        date: entry.date,
        mood: entry.mood,
        flow: entry.flow,
        notes: entry.notes,
        painSymptoms: painSymptoms.rows,
        bloodInFeces: bloodPresence.rows.length > 0 ? bloodPresence.rows[0].in_feces : false,
        bloodInUrine: bloodPresence.rows.length > 0 ? bloodPresence.rows[0].in_urine : false,
        pregnancyTest: "none",
        physicalActivities: ["none"],
        medicines: [],
        createdAt: entry.created_at
      });
      
      console.log(`Migrated entry ID: ${entryId}`);
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Esegui la migrazione
migrateData().then(() => process.exit(0));
