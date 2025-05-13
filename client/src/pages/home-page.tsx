import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [_, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Redirect to calendar page as the main page
    if (isRedirecting) {
      navigate("/calendar");
    }
  }, [isRedirecting, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to calendar...</p>
    </div>
  );
}
