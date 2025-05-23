
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, Area } from "recharts";
import BottomNavigation from "@/components/bottom-navigation";
import ProfileHeader from "@/components/profile-header";

const painData = [
  { date: "Gen 10", value: 2 },
  { date: "Gen 11", value: 4 },
  { date: "Gen 12", value: 3 },
  { date: "Gen 13", value: 5 },
  { date: "Gen 14", value: 2 },
  { date: "Gen 15", value: 1 },
  { date: "Gen 16", value: 3 },
];

const measurementData = [
  { date: "Gen 10", weight: 55.2, waterIntake: 1800, temperature: 36.5 },
  { date: "Gen 11", weight: 55.1, waterIntake: 2000, temperature: 36.6 },
  { date: "Gen 12", weight: 55.3, waterIntake: 1900, temperature: 36.4 },
  { date: "Gen 13", weight: 55.2, waterIntake: 2100, temperature: 36.7 },
  { date: "Gen 14", weight: 55.4, waterIntake: 1950, temperature: 36.5 },
  { date: "Gen 15", weight: 55.3, waterIntake: 2200, temperature: 36.6 },
  { date: "Gen 16", weight: 55.2, waterIntake: 2000, temperature: 36.5 },
];

const chartConfig = {
  pain: { theme: { light: "#FF7373", dark: "#FF7373" } },
  weight: { theme: { light: "#4C9AFF", dark: "#4C9AFF" } },
  water: { theme: { light: "#36B37E", dark: "#36B37E" } },
  temperature: { theme: { light: "#FF8B00", dark: "#FF8B00" } },
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container mx-auto max-w-xl">
        <ProfileHeader title="Report" />
        
        <div className="flex-1 p-4 pb-20">
        <Tabs defaultValue="pain" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="pain">Dolore</TabsTrigger>
            <TabsTrigger value="measurements">Misurazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="pain" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Andamento del dolore</h3>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <Area
                  data={painData}
                  dataKey="value"
                  stroke="var(--color-pain)"
                  fill="var(--color-pain)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => 
                    active && payload?.length ? (
                      <ChartTooltipContent
                        payload={payload}
                        label={payload[0].payload.date}
                        labelFormatter={(value) => `Intensità: ${value}`}
                      />
                    ) : null
                  }
                />
              </ChartContainer>
            </Card>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-4">Peso (kg)</h3>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <Line
                  data={measurementData}
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip content={({ active, payload }) => 
                  active && payload?.length ? (
                    <ChartTooltipContent
                      payload={payload}
                      label={payload[0].payload.date}
                    />
                  ) : null
                } />
              </ChartContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-4">Acqua (ml)</h3>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <Area
                  data={measurementData}
                  dataKey="waterIntake"
                  stroke="var(--color-water)"
                  fill="var(--color-water)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip content={({ active, payload }) => 
                  active && payload?.length ? (
                    <ChartTooltipContent
                      payload={payload}
                      label={payload[0].payload.date}
                    />
                  ) : null
                } />
              </ChartContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-4">Temperatura (°C)</h3>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <Line
                  data={measurementData}
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip content={({ active, payload }) => 
                  active && payload?.length ? (
                    <ChartTooltipContent
                      payload={payload}
                      label={payload[0].payload.date}
                    />
                  ) : null
                } />
              </ChartContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
