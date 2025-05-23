
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import ProfileHeader from "@/components/profile-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MedicalInfo {
  id?: number;
  userId: number;
  endometriosisSurgery: boolean;
  appendectomy: boolean;
  infertility: boolean;
  endometriomaPreOpEcography: boolean;
  endometriomaLocation: string; // "unilateral" | "bilateral"
  endometriomaMaxDiameter: number | null;
  ca125Value: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function MedicalInfoPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Stato per le informazioni mediche
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    userId: user?.id || 0,
    birthDate: null,
    menarcheAge: null,
    smoking: false,
    hormonalTherapy: null,
    endometriosisSurgery: false,
    appendectomy: false,
    infertility: false,
    endometriomaPreOpEcography: false,
    endometriomaLocation: "unilateral",
    endometriomaMaxDiameter: null,
    ca125Value: null
  });

  // Caricamento delle informazioni mediche
  const { data: fetchedMedicalInfo, isLoading, error: queryError } = useQuery<MedicalInfo | null>({
    queryKey: ["/api/medical-info"],
    enabled: !!user,
    retry: 0,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      if (error.status !== 404) {
        console.error("Medical info query error:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare le informazioni mediche",
          variant: "destructive",
        });
      }
    }
  });

  // Imposta lo stato iniziale quando vengono caricate le informazioni
  useEffect(() => {
    if (fetchedMedicalInfo) {
      setMedicalInfo(fetchedMedicalInfo);
    }
  }, [fetchedMedicalInfo]);

  // Funzione per aggiornare i campi booleani
  const handleBooleanChange = (field: keyof MedicalInfo) => {
    setMedicalInfo(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Funzione per aggiornare i campi numerici
  const handleNumberChange = (field: keyof MedicalInfo, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setMedicalInfo(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Funzione per aggiornare la posizione dell'endometrioma
  const handleLocationChange = (value: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      endometriomaLocation: value
    }));
  };

  // Mutazione per salvare le informazioni mediche
  const saveMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      // Controlla se esiste già un record per determinare se usare POST o PUT
      try {
        const checkRes = await fetch(`${baseUrl}/api/medical-info`, {
          credentials: 'include',
          method: 'GET'
        });

        // Se la richiesta ha successo, il record esiste e dobbiamo fare un PUT
        if (checkRes.ok) {
          const res = await fetch(`${baseUrl}/api/medical-info`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(medicalInfo)
          });

          if (!res.ok) {
            throw new Error(`API request failed: ${res.statusText}`);
          }

          return await res.json();
        } else if (checkRes.status === 404) {
          // Record non trovato, usa POST
          const res = await fetch(`${baseUrl}/api/medical-info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(medicalInfo)
          });

          if (!res.ok) {
            throw new Error(`API request failed: ${res.statusText}`);
          }

          return await res.json();
        } else {
          throw new Error(`API request failed: ${checkRes.statusText}`);
        }
      } catch (error: any) {
        console.error("Save mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-info"] });
      
      toast({
        title: "Salvato",
        description: "Le informazioni mediche sono state salvate con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare le informazioni mediche",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto">
      <ProfileHeader showBackButton title="Informazioni mediche specifiche" />

      <div className="p-4 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni anagrafiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data di nascita</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={medicalInfo.birthDate || ''}
                    onChange={(e) => setMedicalInfo(prev => ({...prev, birthDate: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menarcheAge">Età del menarca</Label>
                  <Input
                    id="menarcheAge"
                    type="number"
                    min="0"
                    max="30"
                    value={medicalInfo.menarcheAge || ''}
                    onChange={(e) => setMedicalInfo(prev => ({...prev, menarcheAge: parseInt(e.target.value) || null}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smoking">Fumo</Label>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="smoking-si"
                      className={`px-3 py-1 rounded-md cursor-pointer ${medicalInfo.smoking ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, smoking: true}))}
                    >
                      Sì
                    </Label>
                    <Label 
                      htmlFor="smoking-no"
                      className={`px-3 py-1 rounded-md cursor-pointer ${!medicalInfo.smoking ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, smoking: false}))}
                    >
                      No
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Informazioni chirurgiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="endometriosisSurgery">Pregressa chirurgia endometriosi</Label>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="endometriosisSurgery-si"
                      className={`px-3 py-1 rounded-md cursor-pointer ${medicalInfo.endometriosisSurgery ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => handleBooleanChange('endometriosisSurgery')}
                    >
                      Sì
                    </Label>
                    <Label 
                      htmlFor="endometriosisSurgery-no"
                      className={`px-3 py-1 rounded-md cursor-pointer ${!medicalInfo.endometriosisSurgery ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, endometriosisSurgery: false}))}
                    >
                      No
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="appendectomy">Pregressa appendicectomia</Label>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="appendectomy-si"
                      className={`px-3 py-1 rounded-md cursor-pointer ${medicalInfo.appendectomy ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => handleBooleanChange('appendectomy')}
                    >
                      Sì
                    </Label>
                    <Label 
                      htmlFor="appendectomy-no"
                      className={`px-3 py-1 rounded-md cursor-pointer ${!medicalInfo.appendectomy ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, appendectomy: false}))}
                    >
                      No
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Altre informazioni cliniche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Terapia ormonale</Label>
                  <RadioGroup
                    value={medicalInfo.hormonalTherapy || ''}
                    onValueChange={(value) => setMedicalInfo(prev => ({...prev, hormonalTherapy: value}))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="estroprogestinic_pill" id="pill" />
                      <Label htmlFor="pill">Pillola estroprogestinica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="estroprogestinic_ring" id="ring" />
                      <Label htmlFor="ring">Anello estroprogestinico</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dienogest" id="dienogest" />
                      <Label htmlFor="dienogest">Dienogest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="desogestrel" id="desogestrel" />
                      <Label htmlFor="desogestrel">Desogestrel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="etonogestrel" id="etonogestrel" />
                      <Label htmlFor="etonogestrel">Etonorgestrel (es. NEXPLANON)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drospirenone" id="drospirenone" />
                      <Label htmlFor="drospirenone">Drospirenone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="norethisterone_acetate" id="norethisterone" />
                      <Label htmlFor="norethisterone">Noretisterone acetato</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="levonorgestrel_iud" id="iud" />
                      <Label htmlFor="iud">IUD medicata al levonorgestrel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="triptoreline" id="triptoreline" />
                      <Label htmlFor="triptoreline">Triptoreline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="leuprorelin" id="leuprorelin" />
                      <Label htmlFor="leuprorelin">Peuprorelina</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tibolone" id="tibolone" />
                      <Label htmlFor="tibolone">Tibolone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Altro</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="infertility">Infertilità</Label>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="infertility-si"
                      className={`px-3 py-1 rounded-md cursor-pointer ${medicalInfo.infertility ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => handleBooleanChange('infertility')}
                    >
                      Sì
                    </Label>
                    <Label 
                      htmlFor="infertility-no"
                      className={`px-3 py-1 rounded-md cursor-pointer ${!medicalInfo.infertility ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, infertility: false}))}
                    >
                      No
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="endometriomaPreOpEcography">Ecografia pre-operatoria endometrioma</Label>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="endometriomaPreOpEcography-si"
                      className={`px-3 py-1 rounded-md cursor-pointer ${medicalInfo.endometriomaPreOpEcography ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => handleBooleanChange('endometriomaPreOpEcography')}
                    >
                      Sì
                    </Label>
                    <Label 
                      htmlFor="endometriomaPreOpEcography-no"
                      className={`px-3 py-1 rounded-md cursor-pointer ${!medicalInfo.endometriomaPreOpEcography ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                      onClick={() => setMedicalInfo(prev => ({...prev, endometriomaPreOpEcography: false}))}
                    >
                      No
                    </Label>
                  </div>
                </div>

                {medicalInfo.endometriomaPreOpEcography && (
                  <>
                    <div className="space-y-2">
                      <Label>Localizzazione endometrioma</Label>
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor="location-unilateral"
                          className={`flex-1 text-center py-2 rounded-md cursor-pointer ${medicalInfo.endometriomaLocation === 'unilateral' ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                          onClick={() => handleLocationChange('unilateral')}
                        >
                          Unilaterale
                        </Label>
                        <div className="w-2"></div>
                        <Label 
                          htmlFor="location-bilateral"
                          className={`flex-1 text-center py-2 rounded-md cursor-pointer ${medicalInfo.endometriomaLocation === 'bilateral' ? 'bg-primary/20 text-primary' : 'bg-neutral-100'}`}
                          onClick={() => handleLocationChange('bilateral')}
                        >
                          Bilaterale
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endometriomaMaxDiameter">Diametro max endometrioma (cm)</Label>
                      <Input
                        id="endometriomaMaxDiameter"
                        type="number"
                        placeholder="Valore"
                        value={medicalInfo.endometriomaMaxDiameter ?? ''}
                        onChange={(e) => handleNumberChange('endometriomaMaxDiameter', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ca125Value">Ca125</Label>
                  <Input
                    id="ca125Value"
                    type="number"
                    placeholder="Valore"
                    value={medicalInfo.ca125Value ?? ''}
                    onChange={(e) => handleNumberChange('ca125Value', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salva
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
