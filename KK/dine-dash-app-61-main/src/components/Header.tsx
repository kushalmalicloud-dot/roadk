import { Button } from "@/components/ui/button";
import { ShoppingCart, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { totalItems } = useCart();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-warm-gradient bg-clip-text text-transparent">
              The Road Kitchen
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#menu" className="text-foreground hover:text-primary transition-colors">
              Menu
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to={tableNumber ? `/cart?table=${tableNumber}` : "/cart"}>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link to="/admin-auth">
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            
            <Button variant="hero" size="lg">
              Book Table
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;