import { Home, Stethoscope, BarChart, User } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <div className="mt-auto border-t border-neutral-200 p-2">
      <div className="flex justify-around">
        <button 
          className={`p-3 ${location.includes("/calendar") ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => navigate("/calendar")}
        >
          <Home />
        </button>
        <button 
          className={`p-3 ${location.includes("/medical-info") ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => navigate("/medical-info")}
        >
          <Stethoscope />
        </button>
        <button 
          className={`p-3 ${location.includes("/reports") ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => navigate("/reports")}
        >
          <BarChart />
        </button>
        <button 
          className={`p-3 ${location.includes("/account") ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => navigate("/account")}
        >
          <User />
        </button>
      </div>
    </div>
  );
}
