import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={painData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[0, 6]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px' 
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value) => [`${value}/5`, 'Intensità dolore']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#FF7373"
                        fill="#FF7373"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        dot={{ fill: '#FF7373', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-4">
              <Card className="p-4 bg-white">
                <h3 className="font-medium mb-4 text-gray-800">Peso (kg)</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[54.8, 55.6]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px' 
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value) => [`${value} kg`, 'Peso']}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#4C9AFF"
                        strokeWidth={2}
                        dot={{ fill: '#4C9AFF', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 bg-white">
                <h3 className="font-medium mb-4 text-gray-800">Acqua (ml)</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={measurementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[1600, 2400]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px' 
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value) => [`${value} ml`, 'Acqua']}
                      />
                      <Area
                        type="monotone"
                        dataKey="waterIntake"
                        stroke="#36B37E"
                        fill="#36B37E"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        dot={{ fill: '#36B37E', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 bg-white">
                <h3 className="font-medium mb-4 text-gray-800">Temperatura (°C)</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} domain={[36.2, 36.8]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          borderRadius: '4px' 
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value) => [`${value}°C`, 'Temperatura']}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#FF8B00"
                        strokeWidth={2}
                        dot={{ fill: '#FF8B00', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto max-w-xl">
        <BottomNavigation />
      </div>
    </div>
  );
}