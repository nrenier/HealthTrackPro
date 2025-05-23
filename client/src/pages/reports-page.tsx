
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, Area } from "recharts";
import BottomNavigation from "@/components/bottom-navigation";
import ProfileHeader from "@/components/profile-header";

const painData = [
  { date: "Nov 23", value: 3 },
  { date: "Nov 24", value: 5 },
  { date: "Nov 25", value: 2 },
  { date: "Nov 26", value: 4 },
  { date: "Nov 27", value: 3 },
  { date: "Nov 28", value: 1 },
  { date: "Nov 29", value: 4 },
];

const measurementData = [
  { date: "Nov 23", weight: 65.2, bmi: 23.1, waterIntake: 2000, temperature: 36.5 },
  { date: "Nov 24", weight: 65.3, bmi: 23.2, waterIntake: 2100, temperature: 36.7 },
  { date: "Nov 25", weight: 65.1, bmi: 23.1, waterIntake: 1900, temperature: 36.4 },
  { date: "Nov 26", weight: 65.4, bmi: 23.3, waterIntake: 2200, temperature: 36.8 },
  { date: "Nov 27", weight: 65.2, bmi: 23.2, waterIntake: 2300, temperature: 36.6 },
  { date: "Nov 28", weight: 65.5, bmi: 23.4, waterIntake: 2100, temperature: 36.5 },
  { date: "Nov 29", weight: 65.3, bmi: 23.3, waterIntake: 2400, temperature: 36.9 },
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
      <ProfileHeader title="Report" />
      
      <div className="container flex-1 p-4 pb-20 mx-auto max-w-xl">
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
