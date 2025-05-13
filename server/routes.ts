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
      
      // Create pain symptoms
      if (req.body.painSymptoms && Array.isArray(req.body.painSymptoms)) {
        for (const pain of req.body.painSymptoms) {
          // Validate pain location
          if (!painLocations.includes(pain.location)) {
            continue;
          }
          
          await storage.createPainSymptom({
            diaryEntryId: newEntry.id,
            location: pain.location,
            intensity: pain.intensity,
          });
        }
      }
      
      // Create blood presence record
      if (req.body.bloodPresence) {
        await storage.createBloodPresence({
          diaryEntryId: newEntry.id,
          inFeces: !!req.body.bloodPresence.inFeces,
          inUrine: !!req.body.bloodPresence.inUrine,
        });
      }
      
      // Get the complete entry with all related data
      const completeEntry = await storage.getDiaryEntryWithDetails(newEntry.id);
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
      
      // Update pain symptoms
      if (req.body.painSymptoms && Array.isArray(req.body.painSymptoms)) {
        // Get existing pain symptoms
        const existingPainSymptoms = await storage.getPainSymptomsByDiaryEntryId(existingEntry.id);
        const existingPainMap = new Map(existingPainSymptoms.map(pain => [pain.location, pain]));
        
        for (const pain of req.body.painSymptoms) {
          // Validate pain location
          if (!painLocations.includes(pain.location)) {
            continue;
          }
          
          const existingPain = existingPainMap.get(pain.location);
          
          if (existingPain) {
            // Update existing pain
            await storage.updatePainSymptom(existingPain.id, {
              intensity: pain.intensity,
            });
          } else {
            // Create new pain
            await storage.createPainSymptom({
              diaryEntryId: existingEntry.id,
              location: pain.location,
              intensity: pain.intensity,
            });
          }
        }
      }
      
      // Update blood presence
      if (req.body.bloodPresence) {
        const existingBloodPresence = await storage.getBloodPresenceByDiaryEntryId(existingEntry.id);
        
        if (existingBloodPresence) {
          // Update existing blood presence
          await storage.updateBloodPresence(existingBloodPresence.id, {
            inFeces: req.body.bloodPresence.inFeces !== undefined 
              ? req.body.bloodPresence.inFeces 
              : existingBloodPresence.inFeces,
            inUrine: req.body.bloodPresence.inUrine !== undefined 
              ? req.body.bloodPresence.inUrine 
              : existingBloodPresence.inUrine,
          });
        } else {
          // Create new blood presence
          await storage.createBloodPresence({
            diaryEntryId: existingEntry.id,
            inFeces: !!req.body.bloodPresence.inFeces,
            inUrine: !!req.body.bloodPresence.inUrine,
          });
        }
      }
      
      // Get updated entry with all related data
      const completeEntry = await storage.getDiaryEntryWithDetails(existingEntry.id);
      res.json(completeEntry);
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
