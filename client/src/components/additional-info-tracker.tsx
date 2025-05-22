import { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

// Tipi per i test di gravidanza
export type PregnancyTestType = "none" | "positive" | "negative" | "faint";

// Tipi per le attività fisiche
export type PhysicalActivityType = 
  | "none" 
  | "yoga" 
  | "gym" 
  | "aerobics" 
  | "swimming" 
  | "running" 
  | "cycling" 
  | "walking" 
  | "team-sport";

// Interfaccia per i medicinali
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
}

interface AdditionalInfoTrackerProps {
  pregnancyTest: PregnancyTestType;
  physicalActivities: PhysicalActivityType[];
  medicines: Medicine[];
  onPregnancyTestChange: (value: PregnancyTestType) => void;
  onPhysicalActivitiesChange: (activities: PhysicalActivityType[]) => void;
  onMedicinesChange: (medicines: Medicine[]) => void;
}

export default function AdditionalInfoTracker({
  pregnancyTest,
  physicalActivities,
  medicines,
  onPregnancyTestChange,
  onPhysicalActivitiesChange,
  onMedicinesChange
}: AdditionalInfoTrackerProps) {
  const [newMedicine, setNewMedicine] = useState<{ name: string; dosage: string }>({ name: '', dosage: '' });
  const [visits, setVisits] = useState<Array<{ id: number; type: string; date: string; reportUrl?: string }>>([]);
  const [newVisit, setNewVisit] = useState<{ type: string; date: string; report?: File | null }>({ type: '', date: '' });
  const [activeTab, setActiveTab] = useState<string>("pregnancy");

  // Gestisce la selezione/deselezione delle attività fisiche
  const toggleActivity = (activity: PhysicalActivityType) => {
    const newActivities = [...physicalActivities];

    if (activity === "none") {
      // Se è stato selezionato "nessuna attività", rimuovi tutte le altre
      onPhysicalActivitiesChange(["none"]);
      return;
    }

    // Rimuovi "nessuna attività" se presente quando selezioni un'altra attività
    const filteredActivities = newActivities.filter(act => act !== "none");

    const activityIndex = filteredActivities.indexOf(activity);
    if (activityIndex === -1) {
      // Aggiungi l'attività se non è presente
      onPhysicalActivitiesChange([...filteredActivities, activity]);
    } else {
      // Rimuovi l'attività se è già presente
      filteredActivities.splice(activityIndex, 1);
      onPhysicalActivitiesChange(
        filteredActivities.length === 0 ? ["none"] : filteredActivities
      );
    }
  };

  // Aggiunge un nuovo medicinale
  const addMedicine = () => {
    if (newMedicine.name.trim() === "") return;

    const medicine = {
      id: Date.now().toString(),
      name: newMedicine.name,
      dosage: newMedicine.dosage
    };

    onMedicinesChange([...medicines, medicine]);
    setNewMedicine({ name: "", dosage: "" });
  };

  // Rimuove un medicinale
  const removeMedicine = (id: string) => {
    onMedicinesChange(medicines.filter(med => med.id !== id));
  };

      // Gestione Visite mediche
      const addVisit = () => {
        if (!newVisit.type || !newVisit.date) return;
    
        //uploadReport();
    
        const visit = {
          id: Date.now().toString(),
          type: newVisit.type,
          date: newVisit.date,
          reportUrl: newVisit.report ? URL.createObjectURL(newVisit.report) : undefined,
        };
    
        setVisits([...visits, visit]);
        setNewVisit({ type: '', date: '', report: null });
      };
    
      const removeVisit = (id: string) => {
        setVisits(visits.filter(visit => visit.id !== id));
      };

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Altre informazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="pregnancy">Test di gravidanza</TabsTrigger>
              <TabsTrigger value="activity">Attività fisica</TabsTrigger>
              <TabsTrigger value="medicines">Medicinali</TabsTrigger>
          <TabsTrigger value="visits">Visite Mediche</TabsTrigger>
        </TabsList>

            <TabsContent value="pregnancy" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={pregnancyTest === "none" ? "default" : "outline"}
                  onClick={() => onPregnancyTestChange("none")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🧪</span>
                  <span className="text-xs">Nessun test</span>
                </Button>
                <Button 
                  variant={pregnancyTest === "positive" ? "default" : "outline"}
                  onClick={() => onPregnancyTestChange("positive")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">✅</span>
                  <span className="text-xs">Positivo</span>
                </Button>
                <Button 
                  variant={pregnancyTest === "negative" ? "default" : "outline"}
                  onClick={() => onPregnancyTestChange("negative")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">❌</span>
                  <span className="text-xs">Negativo</span>
                </Button>
                <Button 
                  variant={pregnancyTest === "faint" ? "default" : "outline"}
                  onClick={() => onPregnancyTestChange("faint")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">〰️</span>
                  <span className="text-xs">Linea sbiadita</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={physicalActivities.includes("none") ? "default" : "outline"}
                  onClick={() => toggleActivity("none")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🛋️</span>
                  <span className="text-xs">Nessuna attività</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("yoga") ? "default" : "outline"}
                  onClick={() => toggleActivity("yoga")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🧘‍♀️</span>
                  <span className="text-xs">Yoga</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("gym") ? "default" : "outline"}
                  onClick={() => toggleActivity("gym")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🏋️‍♀️</span>
                  <span className="text-xs">Palestra</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("aerobics") ? "default" : "outline"}
                  onClick={() => toggleActivity("aerobics")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">💃</span>
                  <span className="text-xs">Aerobica e danza</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("swimming") ? "default" : "outline"}
                  onClick={() => toggleActivity("swimming")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🏊‍♀️</span>
                  <span className="text-xs">Nuoto</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("team-sport") ? "default" : "outline"}
                  onClick={() => toggleActivity("team-sport")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🏐</span>
                  <span className="text-xs">Sport di squadra</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("running") ? "default" : "outline"}
                  onClick={() => toggleActivity("running")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🏃‍♀️</span>
                  <span className="text-xs">Corsa</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("cycling") ? "default" : "outline"}
                  onClick={() => toggleActivity("cycling")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🚴‍♀️</span>
                  <span className="text-xs">Bicicletta</span>
                </Button>
                <Button 
                  variant={physicalActivities.includes("walking") ? "default" : "outline"}
                  onClick={() => toggleActivity("walking")}
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-xl mb-1">🚶‍♀️</span>
                  <span className="text-xs">Camminare</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="medicines" className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <Input 
                  placeholder="Nome del medicinale" 
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                />
                <Input 
                  placeholder="Dosaggio" 
                  value={newMedicine.dosage}
                  onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                />
                <Button onClick={addMedicine} type="button" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {medicines.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm p-4">
                  Nessun medicinale aggiunto
                </div>
              ) : (
                <div className="space-y-2">
                  {medicines.map((med) => (
                    <div key={med.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        {med.dosage && <p className="text-xs text-muted-foreground">{med.dosage}</p>}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMedicine(med.id)}
                      >
                        Rimuovi
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="visits" className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <Input 
                  type="text"
                  placeholder="Tipo di visita" 
                  value={newVisit?.type || ''}
                  onChange={(e) => setNewVisit({...newVisit, type: e.target.value})}
                />
                <Input 
                  type="date"
                  value={newVisit?.date || ''}
                  onChange={(e) => setNewVisit({...newVisit, date: e.target.value})}
                />
                <Input 
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewVisit({...newVisit, report: e.target.files?.[0]})}
                />
                <Button onClick={addVisit} type="button" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {visits.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm p-4">
                  Nessuna visita aggiunta
                </div>
              ) : (
                <div className="space-y-2">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div>
                        <p className="font-medium">{visit.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(visit.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {visit.reportUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(visit.reportUrl, '_blank')}
                          >
                            Vedi referto
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeVisit(visit.id)}
                        >
                          Rimuovi
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}