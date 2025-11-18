import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import About from "@/components/About";
import Contact from "@/components/Contact";

const Index = () => {
  useEffect(() => {
    // Update page title and meta description for SEO
    document.title = "The Road Kitchen - Fine Dining Restaurant | Culinary Excellence in NYC";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Experience culinary excellence at The Road Kitchen, NYC\'s premier fine dining restaurant. Award-winning dishes, exceptional service, and unforgettable dining experiences in the heart of the city.');
    }

    // Add JSON-LD structured data for restaurant
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": "The Road Kitchen",
      "description": "Fine dining restaurant specializing in contemporary cuisine with exceptional service",
      "image": "https://theroadkitchen.com/hero-image.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Culinary Street",
        "addressLocality": "New York",
        "addressRegion": "NY",
        "postalCode": "10001",
        "addressCountry": "US"
      },
      "telephone": "(555) 123-4567",
      "email": "hello@theroadkitchen.com",
      "url": "https://theroadkitchen.com",
      "priceRange": "$$$$",
      "servesCuisine": "Contemporary American",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "17:00",
          "closes": "22:00"
        },
        {
          "@type": "OpeningHoursSpecification", 
          "dayOfWeek": ["Friday", "Saturday"],
          "opens": "17:00",
          "closes": "23:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "16:00",
          "closes": "21:00"
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Menu />
        <About />
        <Contact />
      </main>
      
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-warm-gradient bg-clip-text text-transparent mb-4">
                The Road Kitchen
              </h3>
              <p className="text-background/80 leading-relaxed">
                Where culinary artistry meets exceptional hospitality. 
                Experience the finest in contemporary dining.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">Quick Links</h4>
              <nav className="space-y-2">
                <a href="#home" className="block text-background/80 hover:text-background transition-colors">Home</a>
                <a href="#menu" className="block text-background/80 hover:text-background transition-colors">Menu</a>
                <a href="#about" className="block text-background/80 hover:text-background transition-colors">About</a>
                <a href="#contact" className="block text-background/80 hover:text-background transition-colors">Contact</a>
              </nav>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-background">Connect</h4>
              <div className="space-y-2 text-background/80">
                <p>123 Culinary Street, NYC</p>
                <p>(555) 123-4567</p>
                <p>hello@theroadkitchen.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 The Road Kitchen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;