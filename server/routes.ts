import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only pdf, jpg, png
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
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
        visits: Array.isArray(req.body.visits) ? req.body.visits : [],
        medicines: Array.isArray(req.body.medicines) ? req.body.medicines : []
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
        visits: req.body.visits !== undefined ? req.body.visits : existingEntry.visits,
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

      if (req.body.medicines !== undefined) {
        const updatedEntry = await storage.updateDiaryEntry(existingEntry.id, {
          medicines: Array.isArray(req.body.medicines) ? req.body.medicines : []
        });
        if (!updatedEntry) {
          throw new Error("Failed to update medicines");
        }
      }

      if (req.body.visits !== undefined) {
        console.log('Received visits data:', req.body.visits);
        console.log('Is Array?', Array.isArray(req.body.visits));
        
        if (Array.isArray(req.body.visits)) {
          console.log('Visit objects:', req.body.visits.map(v => ({ 
            id: v?.id, 
            type: v?.type, 
            date: v?.date, 
            reportFileName: v?.reportFileName 
          })));
        }
        
        const updatedEntry = await storage.updateDiaryEntry(existingEntry.id, {
          visits: Array.isArray(req.body.visits) ? req.body.visits.map(visit => ({
            id: visit?.id || Date.now(),
            type: visit?.type || '',
            date: visit?.date || new Date().toISOString().split('T')[0],
            reportFileName: visit?.reportFileName
          })) : []
        });
        if (!updatedEntry) {
          throw new Error("Failed to update visits");
        }
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

  // Medical Info Routes
  app.get("/api/medical-info", isAuthenticated, async (req, res, next) => {
    try {
      const info = await storage.getMedicalInfoByUserId(req.user!.id);
      
      if (!info) {
        return res.status(404).json({ message: "No medical info found" });
      }
      
      res.json(info);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/medical-info", isAuthenticated, async (req, res, next) => {
    try {
      // Verifica se l'utente ha già un record delle informazioni mediche
      const existingInfo = await storage.getMedicalInfoByUserId(req.user!.id);

      if (existingInfo) {
        return res.status(409).json({ 
          message: "Medical info already exists for this user",
          info: existingInfo
        });
      }

      // Crea una nuova voce di informazioni mediche
      const newInfo = await storage.createMedicalInfo({
        userId: req.user!.id,
        endometriosisSurgery: req.body.endometriosisSurgery || false,
        appendectomy: req.body.appendectomy || false,
        infertility: req.body.infertility || false,
        endometriomaPreOpEcography: req.body.endometriomaPreOpEcography || false,
        endometriomaLocation: req.body.endometriomaLocation || "unilateral",
        endometriomaMaxDiameter: req.body.endometriomaMaxDiameter || null,
        ca125Value: req.body.ca125Value || null
      });

      res.status(201).json(newInfo);
    } catch (error) {
      next(error);
    }
  });

  // Upload report endpoint
  app.post("/api/upload-report", isAuthenticated, upload.single('report'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const newPath = path.join(process.cwd(), 'uploads', fileName);
    
    fs.renameSync(req.file.path, newPath);
    res.json({ fileName });
  });

  // Download report endpoint
  app.get("/api/reports/:fileName", isAuthenticated, async (req, res) => {
    const filePath = path.join(process.cwd(), 'uploads', req.params.fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.download(filePath);
  });

  app.put("/api/medical-info", isAuthenticated, async (req, res, next) => {
    try {
      // Trova le informazioni mediche esistenti
      const existingInfo = await storage.getMedicalInfoByUserId(req.user!.id);

      if (!existingInfo) {
        return res.status(404).json({ message: "No medical info found for this user" });
      }

      // Aggiorna le informazioni mediche
      const updatedInfo = await storage.updateMedicalInfo(existingInfo.id, {
        endometriosisSurgery: req.body.endometriosisSurgery !== undefined ? req.body.endometriosisSurgery : existingInfo.endometriosisSurgery,
        appendectomy: req.body.appendectomy !== undefined ? req.body.appendectomy : existingInfo.appendectomy,
        infertility: req.body.infertility !== undefined ? req.body.infertility : existingInfo.infertility,
        endometriomaPreOpEcography: req.body.endometriomaPreOpEcography !== undefined ? req.body.endometriomaPreOpEcography : existingInfo.endometriomaPreOpEcography,
        endometriomaLocation: req.body.endometriomaLocation !== undefined ? req.body.endometriomaLocation : existingInfo.endometriomaLocation,
        endometriomaMaxDiameter: req.body.endometriomaMaxDiameter !== undefined ? req.body.endometriomaMaxDiameter : existingInfo.endometriomaMaxDiameter,
        ca125Value: req.body.ca125Value !== undefined ? req.body.ca125Value : existingInfo.ca125Value,
        updatedAt: new Date()
      });

      res.json(updatedInfo);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}