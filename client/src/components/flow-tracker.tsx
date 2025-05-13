import { cn } from "@/lib/utils";
import { Droplet } from "lucide-react";

interface FlowTrackerProps {
  value: string | null;
  onChange: (flow: string) => void;
}

export default function FlowTracker({ value, onChange }: FlowTrackerProps) {
  const flowTypes = [
    { id: "light", label: "Leggero" },
    { id: "medium", label: "Medio" },
    { id: "heavy", label: "Abbondante" },
    { id: "clots", label: "Coaguli" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-medium mb-3">Flusso mestruale</h2>
      <p className="text-sm text-muted-foreground mb-3">Seleziona il flusso medio quotidiano</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {flowTypes.map((flow) => {
          const isSelected = value === flow.id;
          
          return (
            <button 
              key={flow.id}
              className={cn(
                "px-3 py-2 rounded-full text-sm font-medium flex items-center",
                isSelected 
                  ? "bg-primary/10 text-primary border border-primary" 
                  : "bg-white border border-neutral-300 text-muted-foreground"
              )}
              onClick={() => onChange(flow.id)}
            >
              <Droplet className="h-3 w-3 mr-1" />
              {flow.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
