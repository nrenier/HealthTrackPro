
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import ProfileHeader from "@/components/profile-header";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const profileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email("Inserisci un'email valida"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // Qui implementerai la chiamata API per aggiornare i dati dell'account
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProfileHeader title="Il mio account" showBackButton />
      
      <div className="flex-1 container max-w-md mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profilo</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome visualizzato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome visualizzato" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Salva modifiche
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sicurezza</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full mb-3">
              Cambia password
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Gestisci come i tuoi dati vengono utilizzati nell'applicazione.
            </div>
            <Button variant="outline" className="w-full">
              Impostazioni privacy
            </Button>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <div className="space-y-4">
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Logout
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
