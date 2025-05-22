
import { cn } from "@/lib/utils";

interface FlowTrackerProps {
  value: string | null;
  onChange: (flow: string) => void;
}

export default function FlowTracker({ value, onChange }: FlowTrackerProps) {
  const flowTypes = [
    { id: "light", label: "Leggero", drops: "💧" },
    { id: "medium", label: "Medio", drops: "💧💧" },
    { id: "heavy", label: "Abbondante", drops: "💧💧💧" },
    { id: "clots", label: "Coaguli", drops: "❤️" }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-base font-medium mb-3">Flusso mestruale</h2>
      <p className="text-sm text-muted-foreground mb-3">Calcola il flusso medio quotidiano</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {flowTypes.map((flow) => {
          const isSelected = value === flow.id;
          
          return (
            <button 
              key={flow.id}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2",
                isSelected 
                  ? "bg-pink-100 text-pink-700 border border-pink-300" 
                  : "bg-neutral-50 border border-neutral-200 text-neutral-700"
              )}
              onClick={() => onChange(flow.id)}
            >
              <span className="text-base">{flow.drops}</span>
              <span>{flow.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
