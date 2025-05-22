import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Scale, Thermometer, Trash2, PenLine } from "lucide-react";

interface AdditionalInfoTrackerProps {
  waterIntake?: number;
  weight?: number;
  basalTemperature?: number;
  onUpdate: (data: {
    waterIntake?: number;
    weight?: number;
    basalTemperature?: number;
  }) => void;
}

export default function AdditionalInfoTracker({
  waterIntake = 0,
  weight,
  basalTemperature,
  onUpdate
}: AdditionalInfoTrackerProps) {
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingTemp, setEditingTemp] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-medium mb-3">Altre informazioni</h2>

      {/* Water Intake */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <div>
              <div className="font-medium">Acqua</div>
              <div className="text-sm text-gray-500">{waterIntake}/2,25 L</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdate({ waterIntake: Math.max(0, (waterIntake || 0) - 250) })}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdate({ waterIntake: (waterIntake || 0) + 250 })}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Weight */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <div>
              <div className="font-medium">Peso</div>
              {editingWeight ? (
                <Input
                  type="number"
                  value={weight || ''}
                  onChange={(e) => onUpdate({ weight: parseInt(e.target.value) })}
                  className="w-24"
                />
              ) : (
                <div className="text-sm text-gray-500">
                  {weight ? `${weight} kg` : 'Registra il tuo peso'}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEditingWeight(!editingWeight)}
          >
            {editingWeight ? <Trash2 className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Basal Temperature */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-6 w-6" />
            <div>
              <div className="font-medium">Temperatura basale</div>
              {editingTemp ? (
                <Input
                  type="number"
                  value={basalTemperature || ''}
                  onChange={(e) => onUpdate({ basalTemperature: parseInt(e.target.value) })}
                  className="w-24"
                />
              ) : (
                <div className="text-sm text-gray-500">
                  {basalTemperature ? `${basalTemperature}°C` : 'Registra la temperatura'}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEditingTemp(!editingTemp)}
          >
            {editingTemp ? <Trash2 className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}