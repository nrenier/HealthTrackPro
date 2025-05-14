import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertDiaryEntrySchema, 
  insertPainSymptomSchema, 
  insertBloodPresenceSchema,
  painLocations 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Diary Entry Routes
  app.get("/api/diary", isAuthenticated, async (req, res, next) => {
    try {
      const entries = await storage.getDiaryEntriesByUserId(req.user!.id);
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/diary/:date", isAuthenticated, async (req, res, next) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const entry = await storage.getDiaryEntryByUserAndDate(req.user!.id, date);

      if (!entry) {
        return res.status(404).json({ message: "No entry found for this date" });
      }

      res.json(entry);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/diary", isAuthenticated, async (req, res, next) => {
    try {
      // Validate date format
      const dateValidator = z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, { message: "Invalid date format" });

      const validationResult = dateValidator.safeParse(req.body.date);

      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Format date correctly
      const date = new Date(req.body.date);
      date.setUTCHours(0, 0, 0, 0);

      // Check if an entry already exists for this date
      const existingEntry = await storage.getDiaryEntryByUserAndDate(req.user!.id, date);

      if (existingEntry) {
        return res.status(409).json({ 
          message: "An entry already exists for this date", 
          entry: existingEntry 
        });
      }

      // Create diary entry with properly formatted date
      const dateStr = date.toISOString().split('T')[0];
      const newEntry = await storage.createDiaryEntry({
        userId: req.user!.id,
        date: dateStr,
        mood: req.body.mood || null,
        flow: req.body.flow || null,
        notes: req.body.notes || null,
      });

      // Add pain symptoms directly to the diary entry
      if (req.body.painSymptoms && Array.isArray(req.body.painSymptoms)) {
        // Update the diary entry with pain symptoms
        await storage.updateDiaryEntry(newEntry.id, {
          painSymptoms: req.body.painSymptoms.filter(pain => 
            painLocations.includes(pain.location)
          )
        });
      }

      // Add blood presence directly to the diary entry
      if (req.body.bloodPresence) {
        await storage.updateDiaryEntry(newEntry.id, {
          bloodInFeces: !!req.body.bloodPresence.inFeces,
          bloodInUrine: !!req.body.bloodPresence.inUrine
        });
      }

      // Get the complete entry after updates
      const completeEntry = await storage.getDiaryEntryById(newEntry.id);
      res.status(201).json(completeEntry);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/diary/:date", isAuthenticated, async (req, res, next) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Find existing entry
      const existingEntry = await storage.getDiaryEntryByUserAndDate(req.user!.id, date);

      if (!existingEntry) {
        return res.status(404).json({ message: "No entry found for this date" });
      }

      // Update diary entry
      const updatedEntry = await storage.updateDiaryEntry(existingEntry.id, {
        mood: req.body.mood !== undefined ? req.body.mood : existingEntry.mood,
        flow: req.body.flow !== undefined ? req.body.flow : existingEntry.flow,
        notes: req.body.notes !== undefined ? req.body.notes : existingEntry.notes,
      });

      // Aggiorna painSymptoms se presenti nella richiesta
      if (req.body.painSymptoms && Array.isArray(req.body.painSymptoms)) {
        await storage.updateDiaryEntry(existingEntry.id, {
          painSymptoms: req.body.painSymptoms.filter(pain => 
            painLocations.includes(pain.location)
          )
        });
      }

      // Aggiorna bloodPresence se presente nella richiesta
      if (req.body.bloodPresence) {
        await storage.updateDiaryEntry(existingEntry.id, {
          bloodInFeces: !!req.body.bloodPresence.inFeces,
          bloodInUrine: !!req.body.bloodPresence.inUrine
        });
      }

      // Aggiorna dati addizionali se presenti
      if (req.body.pregnancyTest) {
        await storage.updateDiaryEntry(existingEntry.id, {
          pregnancyTest: req.body.pregnancyTest
        });
      }

      if (req.body.physicalActivities) {
        await storage.updateDiaryEntry(existingEntry.id, {
          physicalActivities: req.body.physicalActivities
        });
      }

      if (req.body.medicines) {
        await storage.updateDiaryEntry(existingEntry.id, {
          medicines: req.body.medicines
        });
      }

      // Ottieni l'entry aggiornato completo
      const finalEntry = await storage.getDiaryEntryById(existingEntry.id);
      
      // Return the updated entry
      res.json(finalEntry);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/diary/:date", isAuthenticated, async (req, res, next) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);

      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Find existing entry
      const existingEntry = await storage.getDiaryEntryByUserAndDate(req.user!.id, date);

      if (!existingEntry) {
        return res.status(404).json({ message: "No entry found for this date" });
      }

      // Delete entry (this will cascade to delete related pain symptoms and blood presence)
      const deleted = await storage.deleteDiaryEntry(existingEntry.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete entry" });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}