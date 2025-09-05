import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Página não encontrada</h2>
        <p className="text-xl text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/dashboard">
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
