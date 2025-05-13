import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Redirect to calendar page as the main page
    navigate("/calendar");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to calendar...</p>
    </div>
  );
}
