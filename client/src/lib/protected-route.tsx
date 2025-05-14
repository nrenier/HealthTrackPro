import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export default function ProtectedRoute({
  path,
  component: Component,
  children,
}: {
  path?: string;
  component?: () => React.JSX.Element;
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (path && component) {
    return (
      <Route path={path}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Redirect to="/auth" />
        ) : (
          <Component />
        )}
      </Route>
    );
  }
  
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : (
        children
      )}
    </>
  );
}
