import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";

interface ProfileHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function ProfileHeader({ showBackButton = false, title }: ProfileHeaderProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const displayName = user?.displayName || user?.username || "User";
  // Get first letter of display name for avatar fallback
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center p-4 border-b border-neutral-200 bg-white">
      {showBackButton ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate("/calendar")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      ) : null}

      {title ? (
        <div className="flex items-center justify-center flex-1">
          <Logo 
            size="medium" 
            className="mr-2" 
          />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      ) : (
        <div className="flex items-center">
          <Logo 
            size="medium" 
            className="mr-2" 
          />
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>{firstLetter}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <span className="font-medium">{displayName}</span>
            <span className="ml-1 text-neutral-500 text-sm">Active</span>
          </div>
        </div>
      )}

      {!showBackButton && !title ? (
        <Button variant="ghost" size="icon" className="ml-auto">
          <Menu className="h-5 w-5" />
        </Button>
      ) : null}
    </div>
  );
}