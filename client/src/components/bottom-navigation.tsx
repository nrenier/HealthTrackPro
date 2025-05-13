import { Home, Search, BarChart, User } from "lucide-react";
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
          className="p-3 text-muted-foreground"
          onClick={() => {}}
        >
          <Search />
        </button>
        <button 
          className="p-3 text-muted-foreground"
          onClick={() => {}}
        >
          <BarChart />
        </button>
        <button 
          className="p-3 text-muted-foreground"
          onClick={() => {}}
        >
          <User />
        </button>
      </div>
    </div>
  );
}
