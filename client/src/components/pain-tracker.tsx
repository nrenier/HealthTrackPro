import { useState } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PainSymptom {
  location: string;
  intensity: number;
}

interface BloodPresence {
  inFeces: boolean;
  inUrine: boolean;
}

interface PainTrackerProps {
  painSymptoms: PainSymptom[];
  bloodPresence: BloodPresence;
  onPainChange: (location: string, intensity: number) => void;
  onBloodChange: (type: "inFeces" | "inUrine", value: boolean) => void;
}

export default function PainTracker({ 
  painSymptoms, 
  bloodPresence, 
  onPainChange, 
  onBloodChange 
}: PainTrackerProps) {
  // Define pain types with translation
  const painTypes = [
    { id: "abdominal", label: "Dolore parte bassa addome" },
    { id: "pelvic", label: "Dolore pelvico" },
    { id: "dysmenorrhea", label: "Dismenorrea, Stipsi" },
    { id: "defecation", label: "Dolore durante defecazione" },
    { id: "urination", label: "Dolore durante emissione urina" },
    { id: "sexualIntercourse", label: "Dolore durante rapporto sessuale" },
    { id: "postSexual", label: "Dolore dopo rapporto sessuale" }
  ];

  // Get pain value by location
  const getPainValue = (location: string): number => {
    const pain = painSymptoms.find(p => p.location === location);
    return pain ? pain.intensity : 0;
  };

  return (
    <div>
      <h2 className="text-base font-medium mb-3">Dolore</h2>
      
      {painTypes.map((pain) => {
        const value = getPainValue(pain.id);
        
        return (
          <div key={pain.id} className="mb-4">
            <div className="flex justify-between mb-1">
              <Label htmlFor={`pain-${pain.id}`} className="text-sm text-neutral-700">
                {pain.label}
              </Label>
              <span className={cn(
                "text-sm font-medium",
                value > 0 ? "text-primary" : "text-muted-foreground"
              )}>
                {value}
              </span>
            </div>
            <div className="relative">
              <Slider
                id={`pain-${pain.id}`}
                defaultValue={[value]}
                min={0}
                max={10}
                step={1}
                onValueChange={(values) => onPainChange(pain.id, values[0])}
              />
              <div className="absolute top-3 left-0 right-0 flex justify-between px-1 text-[10px] text-muted-foreground">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i + 1}>{i + 1}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Blood presence tracking */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="blood-feces" className="text-sm text-neutral-700">
            Sangue nelle feci
          </Label>
          <Switch
            id="blood-feces"
            checked={bloodPresence.inFeces}
            onCheckedChange={(checked) => onBloodChange("inFeces", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="blood-urine" className="text-sm text-neutral-700">
            Sangue nelle urine
          </Label>
          <Switch
            id="blood-urine"
            checked={bloodPresence.inUrine}
            onCheckedChange={(checked) => onBloodChange("inUrine", checked)}
          />
        </div>
      </div>
    </div>
  );
}
