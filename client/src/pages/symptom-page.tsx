import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { format, parse } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DiaryEntryWithDetails, PainSymptom } from "@shared/schema";

import ProfileHeader from "@/components/profile-header";
import MoodTracker from "@/components/mood-tracker";
import FlowTracker from "@/components/flow-tracker";
import PainTracker from "@/components/pain-tracker";
import AdditionalInfoTracker, { 
  PregnancyTestType, PhysicalActivityType, Medicine 
} from "@/components/additional-info-tracker";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SymptomPage() {
  const params = useParams<{ date: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Validate date format
  const parsedDate = params.date ? new Date(params.date) : new Date();
  const isValidDate = !isNaN(parsedDate.getTime());
  const [shouldRedirect, setShouldRedirect] = useState(!isValidDate);

  // Handle redirection if invalid date
  useEffect(() => {
    if (shouldRedirect) {
      navigate("/calendar");
    }
  }, [shouldRedirect, navigate]);

  const formattedDate = format(parsedDate, "yyyy-MM-dd");
  const displayDate = format(parsedDate, "d MMMM");

  // State for form
  const [mood, setMood] = useState<string | null>(null);
  const [flow, setFlow] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [painSymptoms, setPainSymptoms] = useState<PainSymptom[]>([]);
  const [bloodPresence, setBloodPresence] = useState({
    inFeces: false,
    inUrine: false
  });
  const [pregnancyTest, setPregnancyTest] = useState<PregnancyTestType>("none");
  const [physicalActivities, setPhysicalActivities] = useState<PhysicalActivityType[]>(["none"]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Fetch diary entry if exists
  const { data: entryData, isLoading, error: queryError } = useQuery<DiaryEntryWithDetails | null>({
    queryKey: [`/api/diary/${formattedDate}`],
    enabled: !!user,
    retry: 0,
    retryOnMount: false,
    retryOnReconnect: false,
    staleTime: 30000, // 30 secondi
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      // Per i 404 restituisci null (data nuova, è normale)
      if (error.status === 404) {
        return null;
      }

      // Altri errori
      if (error.status !== 404) {
        console.error("Diary query error:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati del diario",
          variant: "destructive",
        });
      }
    }
  });

  // Utilizziamo direttamente onError nella query invece di questo useEffect
  // che potrebbe causare problemi con la gestione dello stato

  // Set form data if entry exists
  useEffect(() => {
    if (entryData) {
      setMood(entryData.mood);
      setFlow(entryData.flow);
      setNotes(entryData.notes);
      setPainSymptoms(entryData.painSymptoms || []);

      setBloodPresence({
        inFeces: entryData.bloodInFeces || false,
        inUrine: entryData.bloodInUrine || false
      });

      setPregnancyTest(entryData.pregnancyTest || "none");
      setPhysicalActivities(entryData.physicalActivities || ["none"]);
      setMedicines(entryData.medicines || []);
    }
  }, [entryData]);

  // Handle pain changes
  const handlePainChange = (location: string, intensity: number) => {
    setPainSymptoms(prev => {
      const existing = prev.find(p => p.location === location);
      if (existing) {
        return prev.map(p => 
          p.location === location ? { ...p, intensity } : p
        );
      } else {
        return [...prev, { 
          id: Math.random(), 
          location, 
          intensity, 
          diaryEntryId: entryData?.id || 0, 
          createdAt: new Date() 
        }];
      }
    });
  };

  // Handle blood presence changes
  const handleBloodChange = (type: "inFeces" | "inUrine", value: boolean) => {
    setBloodPresence(prev => ({ ...prev, [type]: value }));
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date: formattedDate,
        mood,
        flow,
        notes,
        painSymptoms: painSymptoms.map(p => ({
          location: p.location,
          intensity: p.intensity
        })),
        bloodPresence,
        pregnancyTest,
        physicalActivities,
        medicines
      };

      // Utilizziamo POST come predefinito per creare nuovi record
      let method = "POST";
      let endpoint = "/api/diary";

      // Verifica se l'entry esiste già
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      try {
        const checkRes = await fetch(`${baseUrl}/api/diary/${formattedDate}`, {
          credentials: 'include',
          method: 'GET'
        });

        // Se la richiesta ha successo, l'entry esiste e dobbiamo fare un PUT invece
        if (checkRes.ok) {
          method = "PUT";
          endpoint = `/api/diary/${formattedDate}`;
        }
      } catch (e) {
        console.error("Error checking entry existence:", e);
        // In caso di errore, continuiamo con POST per sicurezza
      }

      try {
        console.log(`Submitting with ${method} to ${endpoint}`);
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          // Se otteniamo un 409 (conflitto - record esiste già), proviamo con PUT
          if (res.status === 409 && method === "POST") {
            console.log("Entry already exists, switching to PUT");
            const putRes = await fetch(`${baseUrl}/api/diary/${formattedDate}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(payload)
            });

            if (!putRes.ok) {
              throw new Error(`API PUT request failed: ${putRes.statusText}`);
            }

            return await putRes.json();
          }

          throw new Error(`API request failed: ${res.statusText}`);
        }

        return await res.json();
      } catch (error: any) {
        console.error("Save mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/${formattedDate}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });

      toast({
        title: "Salvato",
        description: "I dati sono stati salvati con successo",
      });

      navigate("/calendar");
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare i dati",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto">
      <ProfileHeader showBackButton title="Come ti senti oggi?" />

      <div className="p-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <MoodTracker value={mood} onChange={setMood} />

            <FlowTracker value={flow} onChange={setFlow} />

            <PainTracker 
              painSymptoms={painSymptoms} 
              bloodPresence={bloodPresence}
              onPainChange={handlePainChange}
              onBloodChange={handleBloodChange}
            />

            <AdditionalInfoTracker
              pregnancyTest={pregnancyTest}
              physicalActivities={physicalActivities}
              medicines={medicines}
              onPregnancyTestChange={setPregnancyTest}
              onPhysicalActivitiesChange={setPhysicalActivities}
              onMedicinesChange={setMedicines}
            />

            <div className="mb-6">
              <h2 className="text-base font-medium mb-3">Note</h2>
              <Textarea
                placeholder="Aggiungi note opzionali qui..."
                value={notes || ""}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salva
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}