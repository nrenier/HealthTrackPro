import { useState } from "react";
import { cn } from "@/lib/utils";

interface MoodTrackerProps {
  value: string | null;
  onChange: (mood: string) => void;
}

export default function MoodTracker({ value, onChange }: MoodTrackerProps) {
  const symptoms = [
    { id: "cramps", label: "Crampi", icon: "/public/images/icon_1.png" },
    {
      id: "breast-pain",
      label: "Tensione al seno",
      icon: "/public/images/icon_2.png",
    },
    {
      id: "back-pain",
      label: "Mal di schiena",
      icon: "/public/images/icon_3.png",
    },
    { id: "bloating", label: "Gonfiore", icon: "/public/images/icon_4.png" },
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
                  : "bg-neutral-100 border border-neutral-200",
              )}
            >
              <img
                src={symptom.icon}
                alt={symptom.label}
                className="w-12 h-12 object-contain rounded-full"
              />
            </div>
            <span className="text-xs mt-1 text-center max-w-[80px]">
              {symptom.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
