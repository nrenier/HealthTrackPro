import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import ProfileHeader from "@/components/profile-header";
import CalendarGrid from "@/components/calendar-grid";
import BottomNavigation from "@/components/bottom-navigation";

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto">
      <ProfileHeader />
      
      <div className="p-4 flex-1">
        <CalendarGrid />
      </div>
      
      <BottomNavigation />
    </div>
  );
}
