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
  
  // Fetch diary entry if exists
  const { data: entryData, isLoading, error: queryError } = useQuery<DiaryEntryWithDetails>({
    queryKey: [`/api/diary/${formattedDate}`],
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no entry yet)
      if (error?.status === 404) return false;
      return failureCount < 3;
    }
  });
  
  // Handle query error
  useEffect(() => {
    if (queryError && (queryError as any).status !== 404) {
      toast({
        title: "Error",
        description: "Failed to load diary entry",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);
  
  // Set form state from fetched data
  useEffect(() => {
    if (entryData) {
      setMood(entryData.mood);
      setFlow(entryData.flow);
      setNotes(entryData.notes);
      setPainSymptoms(entryData.painSymptoms || []);
      if (entryData.bloodPresence) {
        setBloodPresence({
          inFeces: entryData.bloodPresence.inFeces,
          inUrine: entryData.bloodPresence.inUrine
        });
      }
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
        bloodPresence
      };
      
      if (entryData) {
        // Update existing entry
        const res = await apiRequest("PUT", `/api/diary/${formattedDate}`, payload);
        return await res.json();
      } else {
        // Create new entry
        const res = await apiRequest("POST", "/api/diary", payload);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/${formattedDate}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      
      toast({
        title: "Success",
        description: "Diary entry saved successfully",
      });
      
      navigate("/calendar");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save diary entry",
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
