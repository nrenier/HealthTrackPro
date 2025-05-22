
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MoodTrackerProps {
  value: string | null;
  onChange: (mood: string) => void;
}

export default function MoodTracker({ value, onChange }: MoodTrackerProps) {
  const symptoms = [
    { id: "cramps", label: "Crampi", icon: "🔴" },
    { id: "breast-pain", label: "Tensione al seno", icon: "🟣" },
    { id: "back-pain", label: "Mal di schiena", icon: "🟡" },
    { id: "bloating", label: "Gonfiore", icon: "⚪" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-medium mb-3">Come ti senti oggi?</h2>
      <div className="flex justify-around mb-6">
        {symptoms.map((symptom) => (
          <button 
            key={symptom.id}
            className="flex flex-col items-center"
            onClick={() => onChange(symptom.id)}
          >
            <div 
              className={cn(
                "w-12 h-12 flex items-center justify-center text-2xl rounded-full",
                value === symptom.id 
                  ? "bg-primary/10 border-2 border-primary" 
                  : "bg-neutral-100 border border-neutral-200"
              )}
            >
              {symptom.icon}
            </div>
            <span className="text-xs mt-1 text-center max-w-[80px]">{symptom.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
