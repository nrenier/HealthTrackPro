import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CalendarPage from "@/pages/calendar-page";
import SymptomPage from "@/pages/symptom-page";
import AccountPage from "@/pages/account-page";
import ReportsPage from "./pages/reports-page";
import NotFoundPage from "@/pages/not-found";
import MedicalInfoPage from "@/pages/medical-info-page"; // Import MedicalInfoPage

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/calendar">
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            </Route>
            <Route path="/symptom/:date">
              <ProtectedRoute>
                <SymptomPage />
              </ProtectedRoute>
            </Route>
            <Route path="/calendar/:date">
              <SymptomPage />
            </Route>

            <Route path="/medical-info">
              <ProtectedRoute>
                <MedicalInfoPage />
              </ProtectedRoute>
            </Route>

            <Route path="/account">
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            </Route>
            <Route path="/reports">
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            </Route>
            <Route component={NotFoundPage} />
          </Switch>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}