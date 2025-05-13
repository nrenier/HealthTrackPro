import { useState } from "react";
import { cn } from "@/lib/utils";
import { SmilePlus, Meh, Frown } from "lucide-react";

interface MoodTrackerProps {
  value: string | null;
  onChange: (mood: string) => void;
}

export default function MoodTracker({ value, onChange }: MoodTrackerProps) {
  const moods = [
    { id: "sad", icon: Frown, label: "Sad" },
    { id: "neutral", icon: Meh, label: "Neutral" },
    { id: "happy", icon: SmilePlus, label: "Happy" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-medium mb-3">Come ti senti oggi?</h2>
      <div className="flex justify-around mb-6">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = value === mood.id;
          
          return (
            <button 
              key={mood.id}
              className="flex flex-col items-center"
              onClick={() => onChange(mood.id)}
            >
              <div 
                className={cn(
                  "w-12 h-12 flex items-center justify-center text-2xl rounded-full",
                  isSelected 
                    ? "text-primary border border-primary" 
                    : "text-muted-foreground border border-neutral-300"
                )}
              >
                <Icon size={24} />
              </div>
              <span className="text-xs mt-1">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
