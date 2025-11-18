import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type MenuItem = {
  name: string;
  category: string;
  foodType: "veg" | "non-veg" | "egg";
  halfPrice?: number;
  fullPrice?: number;
  image?: string;
};

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedPortion, setSelectedPortion] = useState<"half" | "full">(
    item.halfPrice ? "half" : "full"
  );

  const hasBothPortions = item.halfPrice && item.fullPrice;
  const currentPrice = selectedPortion === "half" ? item.halfPrice : item.fullPrice;

  const handleAddToCart = () => {
    if (!currentPrice) return;

    addToCart({
      name: item.name,
      price: currentPrice,
      quantity: 1,
      portion: hasBothPortions ? selectedPortion : undefined,
      foodType: item.foodType,
    });

    toast({
      title: "Added to cart",
      description: `${item.name} ${hasBothPortions ? `(${selectedPortion})` : ""} has been added to your cart.`,
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="h-32 bg-slate-700 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-500" />
        )}
      </div>
      
      {/* Content Section */}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold line-clamp-1">{item.name}</h3>
              {item.foodType === "veg" && (
                <span className="w-4 h-4 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </span>
              )}
              {item.foodType === "non-veg" && (
                <span className="w-4 h-4 border-2 border-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </span>
              )}
              {item.foodType === "egg" && (
                <span className="w-4 h-4 border-2 border-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                </span>
              )}
            </div>
          </div>

          {/* Portion Selection */}
          {hasBothPortions && (
            <RadioGroup
              value={selectedPortion}
              onValueChange={(value) => setSelectedPortion(value as "half" | "full")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="half" id={`half-${item.name}`} />
                <Label htmlFor={`half-${item.name}`} className="text-xs cursor-pointer">
                  Half - ₹{item.halfPrice}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id={`full-${item.name}`} />
                <Label htmlFor={`full-${item.name}`} className="text-xs cursor-pointer">
                  Full - ₹{item.fullPrice}
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Single Price Display */}
          {!hasBothPortions && (
            <p className="text-sm text-slate-300">
              Price: ₹{item.fullPrice}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-yellow-500">
              ₹{currentPrice}
            </span>
            <Button 
              size="icon" 
              className="h-8 w-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const menuItems: MenuItem[] = [
    // The Road Kitchen Special
    { name: "Veg Pahadi Noodles", category: "special", foodType: "veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/veg-pahadi-noodles.png" },
    { name: "Veg Crunch Roll", category: "special", foodType: "veg", fullPrice: 200, image: "/images/menu/veg-crunch-roll.jpg" },
    { name: "Veg Goldie Cutlets", category: "special", foodType: "veg", fullPrice: 280, image: "/images/menu/veg-goldie-cutlets.png" },
    { name: "Egg Pahadi Noodles", category: "special", foodType: "egg", halfPrice: 120, fullPrice: 180, image: "/images/menu/egg-pahadi-noodles.png" },
    { name: "Chicken Pahadi Noodles", category: "special", foodType: "non-veg", halfPrice: 160, fullPrice: 240, image: "/images/menu/chicken-pahadi-noodles.png" },
    { name: "Chicken Pahadi Masala Rice", category: "special", foodType: "non-veg", halfPrice: 180, fullPrice: 260, image: "/images/menu/chicken-pahadi-masala-rice.png" },
    { name: "Chicken Popcorn Rice", category: "special", foodType: "non-veg", fullPrice: 250, image: "/images/menu/chicken-popcorn-rice.png" },
    { name: "Chicken Saathe", category: "special", foodType: "non-veg", fullPrice: 240, image: "/images/menu/chicken-saathe.png" },
    { name: "Chicken Popcorns", category: "special", foodType: "non-veg", fullPrice: 200, image: "/images/menu/chicken-popcorns.png" },
    { name: "Chicken Fingers", category: "special", foodType: "non-veg", fullPrice: 240, image: "/images/menu/chicken-fingers.png" },
    { name: "Chicken Haveli", category: "special", foodType: "non-veg", fullPrice: 260, image: "/images/menu/chicken-haveli.png" },
    { name: "Bangkok Chicken", category: "special", foodType: "non-veg", fullPrice: 300, image: "/images/menu/bangkok-chicken.png" },
    { name: "Chicken Creamy Bomb", category: "special", foodType: "non-veg", fullPrice: 320, image: "/images/menu/chicken-creamy-bomb.png" },

    // Veg Starters
    { name: "Vegetable Crispy", category: "veg-starters", foodType: "veg", fullPrice: 220, image: "/images/menu/vegetable-crispy.png" },
    { name: "Paneer Crispy", category: "veg-starters", foodType: "veg", halfPrice: 150, fullPrice: 210, image: "/images/menu/paneer-crispy.jpg" },
    { name: "Paneer 65", category: "veg-starters", foodType: "veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/paneer-65.png" },
    { name: "Veg Spring Roll", category: "veg-starters", foodType: "veg", fullPrice: 240, image: "/images/menu/veg-spring-roll.jpg" },
    { name: "Mix Veg Crispy", category: "veg-starters", foodType: "veg", fullPrice: 220, image: "/images/menu/mix-veg-crispy.jpg" },
    { name: "Hara Bhara Kebab", category: "veg-starters", foodType: "veg", fullPrice: 240, image: "/images/menu/hara-bhara-kebab.jpg" },
    { name: "Veg Cheese Tikki", category: "veg-starters", foodType: "veg", fullPrice: 210, image: "/images/menu/veg-cheese-tikki.jpg" },
    { name: "Paneer Korean Chilly", category: "veg-starters", foodType: "veg", fullPrice: 220, image: "/images/menu/paneer-korean-chilly.png" },
    { name: "Veg Manchurian", category: "veg-starters", foodType: "veg", fullPrice: 220, image: "/images/menu/veg-manchurian.png" },
    { name: "Cheese Ball", category: "veg-starters", foodType: "veg", fullPrice: 220, image: "/images/menu/cheese-ball.png" },

    // Non-Veg Starters
    { name: "Egg Burjji (2 Eggs)", category: "non-veg-starters", foodType: "egg", fullPrice: 100, image: "/images/menu/egg-burjji.jpg" },
    { name: "Masala Omelet (2 Eggs)", category: "non-veg-starters", foodType: "egg", fullPrice: 60, image: "/images/menu/masala-omelet.jpg" },
    { name: "Chicken Crispy", category: "non-veg-starters", foodType: "non-veg", fullPrice: 220, image: "/images/menu/chicken-crispy.png" },
    { name: "Chicken Lollypop", category: "non-veg-starters", foodType: "non-veg", fullPrice: 220, image: "/images/menu/chicken-lollypop.jpg" },
    { name: "Chicken Schezwan Lollypop", category: "non-veg-starters", foodType: "non-veg", fullPrice: 230, image: "/images/menu/chicken-schezwan-lollypop.png" },
    { name: "Chicken Flamingo Lollypop", category: "non-veg-starters", foodType: "non-veg", fullPrice: 250, image: "/images/menu/chicken-flamingo-lollypop.jpg" },
    { name: "Chicken 65", category: "non-veg-starters", foodType: "non-veg", fullPrice: 220, image: "/images/menu/chicken-65.jpg" },
    { name: "Chicken Spring Roll", category: "non-veg-starters", foodType: "non-veg", fullPrice: 340, image: "/images/menu/chicken-spring-roll.jpg" },
    { name: "Chicken Cheese Spring Roll", category: "non-veg-starters", foodType: "non-veg", fullPrice: 380, image: "/images/menu/chicken-cheese-spring-roll.jpg" },

    // Soups
    { name: "Manchow Soup (Veg)", category: "soups", foodType: "veg", fullPrice: 100, image: "/images/menu/manchow-soup-veg.png" },
    { name: "Manchow Soup (Non-Veg)", category: "soups", foodType: "non-veg", fullPrice: 120, image: "/images/menu/manchow-soup-non-veg.jpg" },
    { name: "Hot and Sour Soup (Veg)", category: "soups", foodType: "veg", fullPrice: 120, image: "/images/menu/hot-and-sour-soup-veg.png" },
    { name: "Hot and Sour Soup (Non-Veg)", category: "soups", foodType: "non-veg", fullPrice: 130, image: "/images/menu/hot-and-sour-soup-non-veg.png" },
    { name: "Clear Soup (Veg)", category: "soups", foodType: "veg", fullPrice: 100, image: "/images/menu/clear-soup-veg.png" },
    { name: "Clear Soup (Non-Veg)", category: "soups", foodType: "non-veg", fullPrice: 120, image: "/images/menu/clear-soup-non-veg.png" },
    { name: "Hum Tum Soup (Veg)", category: "soups", foodType: "veg", fullPrice: 110, image: "/images/menu/hum-tum-soup-veg.png" },
    { name: "Hum Tum Soup (Non-Veg)", category: "soups", foodType: "non-veg", fullPrice: 120, image: "/images/menu/hum-tum-soup-non-veg.png" },
    { name: "Lemon Coriander Soup (Veg)", category: "soups", foodType: "veg", fullPrice: 120, image: "/images/menu/lemon-coriander-soup-veg.png" },
    { name: "Lemon Coriander Soup (Non-Veg)", category: "soups", foodType: "non-veg", fullPrice: 140, image: "/images/menu/lemon-coriander-soup-non-veg.png" },

    // Manchurian
    { name: "Veg Manchurian", category: "manchurian", foodType: "veg", halfPrice: 120, fullPrice: 170, image: "/images/menu/veg-manchurian-balls.png" },
    { name: "Veg Korean Manchurian", category: "manchurian", foodType: "veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/veg-korean-manchurian.png" },
    { name: "Chicken Manchurian", category: "manchurian", foodType: "non-veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/chicken-manchurian.png" },
    { name: "Chicken Korean Manchurian", category: "manchurian", foodType: "non-veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/chicken-korean-manchurian.png" },

    // Chilly Dishes
    { name: "Mix Vegetable Chilly", category: "chilly", foodType: "veg", fullPrice: 260, image: "/images/menu/mix-vegetable-chilly.png" },
    { name: "Veg Korean Chilly", category: "chilly", foodType: "veg", fullPrice: 190, image: "/images/menu/veg-korean-chilly.jpg" },
    { name: "Paneer Chilly", category: "chilly", foodType: "veg", fullPrice: 170, image: "/images/menu/paneer-chilly.png" },
    { name: "Paneer Korean Chilly", category: "chilly", foodType: "veg", fullPrice: 180, image: "/images/menu/paneer-korean-chilly-dish.png" },
    { name: "Veg Honey Chilly Potato", category: "chilly", foodType: "veg", fullPrice: 180, image: "/images/menu/veg-honey-chilly-potato.png" },
    { name: "Veg Honey Chilly Cauliflower", category: "chilly", foodType: "veg", fullPrice: 200, image: "/images/menu/veg-honey-chilly-cauliflower.jpg" },
    { name: "Chicken Chilly", category: "chilly", foodType: "non-veg", fullPrice: 200, image: "/images/menu/chicken-chilly.jpg" },
    { name: "Chicken Korean Chilly", category: "chilly", foodType: "non-veg", fullPrice: 230, image: "/images/menu/chicken-korean-chilly.jpg" },
    { name: "Lemon Chicken Chilly", category: "chilly", foodType: "non-veg", fullPrice: 200, image: "/images/menu/lemon-chicken-chilly.png" },
    { name: "Prawns Chilly (APS)", category: "chilly", foodType: "non-veg", fullPrice: 260, image: "/images/menu/prawns-chilly.png" },

    // Bhel
    { name: "Veg Chinese Bhel", category: "bhel", foodType: "veg", halfPrice: 100, fullPrice: 120, image: "/images/menu/veg-chinese-bhel.png" },
    { name: "Chicken Chinese Bhel", category: "bhel", foodType: "non-veg", halfPrice: 120, fullPrice: 130, image: "/images/menu/chicken-chinese-bhel.jpg" },

    // Rice - Veg
    { name: "Veg Fried Rice", category: "rice", foodType: "veg", halfPrice: 100, fullPrice: 160, image: "/images/menu/veg-fried-rice.jpg" },
    { name: "Veg Schezwan Fried Rice", category: "rice", foodType: "veg", halfPrice: 120, fullPrice: 180, image: "/images/menu/veg-schezwan-fried-rice.jpg" },
    { name: "Veg Triple Rice", category: "rice", foodType: "veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/veg-triple-rice.png" },
    { name: "Veg Chopper Rice", category: "rice", foodType: "veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/veg-chopper-rice.jpg" },
    { name: "Veg Burnt Garlic Rice", category: "rice", foodType: "veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/veg-burnt-garlic-rice.png" },
    { name: "Veg Hong Kong Rice", category: "rice", foodType: "veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/veg-hong-kong-rice.jpg" },
    { name: "Veg Manchurian Fried Rice", category: "rice", foodType: "veg", halfPrice: 160, fullPrice: 230, image: "/images/menu/veg-manchurian-fried-rice.png" },

    // Rice - Non-Veg
    { name: "Chicken Fried Rice", category: "rice", foodType: "non-veg", halfPrice: 120, fullPrice: 180, image: "/images/menu/chicken-fried-rice.png" },
    { name: "Chicken Schezwan Fried Rice", category: "rice", foodType: "non-veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/chicken-schezwan-fried-rice.png" },
    { name: "Chicken Manchurian Rice", category: "rice", foodType: "non-veg", fullPrice: 220, image: "/images/menu/chicken-manchurian-rice.jpg" },
    { name: "Chicken Hong Kong Rice", category: "rice", foodType: "non-veg", halfPrice: 180, fullPrice: 260, image: "/images/menu/chicken-hong-kong-rice.jpg" },
    { name: "Chicken Triple Rice", category: "rice", foodType: "non-veg", halfPrice: 140, fullPrice: 200, image: "/images/menu/chicken-triple-rice.png" },
    { name: "Chicken Chopper Rice", category: "rice", foodType: "non-veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/chicken-chopper-rice.png" },
    { name: "Egg Fried Rice", category: "rice", foodType: "egg", fullPrice: 140, image: "/images/menu/egg-fried-rice.jpg" },
    { name: "Egg Schezwan Fried Rice", category: "rice", foodType: "egg", fullPrice: 160, image: "/images/menu/egg-schezwan-fried-rice.jpg" },
    { name: "Egg Burnt Garlic Rice", category: "rice", foodType: "egg", fullPrice: 180, image: "/images/menu/egg-burnt-garlic-rice.jpg" },
    { name: "Prawns Fried Rice", category: "rice", foodType: "non-veg", fullPrice: 230, image: "/images/menu/prawns-fried-rice.jpg" },
    { name: "Prawns Schezwan Rice", category: "rice", foodType: "non-veg", fullPrice: 250, image: "/images/menu/prawns-schezwan-rice.jpg" },

    // Noodles - Veg
    { name: "Veg Hakka Noodles", category: "noodles", foodType: "veg", halfPrice: 120, fullPrice: 160, image: "/images/menu/veg-hakka-noodles.png" },
    { name: "Veg Schezwan Noodles", category: "noodles", foodType: "veg", halfPrice: 140, fullPrice: 220, image: "/images/menu/veg-schezwan-noodles.jpg" },
    { name: "Veg Hong Kong Noodles", category: "noodles", foodType: "veg", halfPrice: 160, fullPrice: 220, image: "/images/menu/veg-hong-kong-noodles.jpg" },

    // Noodles - Non-Veg
    { name: "Chicken Hakka Noodles", category: "noodles", foodType: "non-veg", halfPrice: 130, fullPrice: 190, image: "/images/menu/chicken-hakka-noodles.jpg" },
    { name: "Chicken Schezwan Noodles", category: "noodles", foodType: "non-veg", halfPrice: 150, fullPrice: 210, image: "/images/menu/chicken-schezwan-noodles.jpg" },
    { name: "Chicken Hong Kong Noodles", category: "noodles", foodType: "non-veg", halfPrice: 180, fullPrice: 260, image: "/images/menu/chicken-hong-kong-noodles.png" },
    { name: "Egg Hakka Noodles", category: "noodles", foodType: "egg", fullPrice: 150, image: "/images/menu/egg-hakka-noodles.jpg" },
    { name: "Egg Schezwan Noodles", category: "noodles", foodType: "egg", fullPrice: 170, image: "/images/menu/egg-schezwan-noodles.jpg" },
    { name: "Egg Hong Kong Noodles", category: "noodles", foodType: "egg", fullPrice: 200, image: "/images/menu/egg-hong-kong-noodles.jpg" },

    // Momos - Veg
    { name: "Steam Momos (Veg)", category: "momos", foodType: "veg", fullPrice: 140, image: "/images/menu/steam-momos-veg.jpg" },
    { name: "Fried Momos (Veg)", category: "momos", foodType: "veg", fullPrice: 160, image: "/images/menu/fried-momos-veg.jpg" },
    { name: "Kurkure Momos (Veg)", category: "momos", foodType: "veg", fullPrice: 180, image: "/images/menu/kurkure-momos-veg.jpg" },
    { name: "Chilly Momos (Veg)", category: "momos", foodType: "veg", fullPrice: 210, image: "/images/menu/chilly-momos-veg.jpg" },

    // Momos - Non-Veg
    { name: "Steam Momos (Non-Veg)", category: "momos", foodType: "non-veg", fullPrice: 160, image: "/images/menu/steam-momos-non-veg.jpg" },
    { name: "Fried Momos (Non-Veg)", category: "momos", foodType: "non-veg", fullPrice: 180, image: "/images/menu/fried-momos-non-veg.jpg" },
    { name: "Kurkure Momos (Non-Veg)", category: "momos", foodType: "non-veg", fullPrice: 210, image: "/images/menu/kurkure-momos-non-veg.jpg" },
    { name: "Chilly Momos (Non-Veg)", category: "momos", foodType: "non-veg", fullPrice: 240, image: "/images/menu/chilly-momos-non-veg.jpg" },
  ];

  const categories = [
    { id: "all", label: "All" },
    { id: "special", label: "The Road Kitchen Special" },
    { id: "veg-starters", label: "Veg Starters" },
    { id: "non-veg-starters", label: "Non-Veg Starters" },
    { id: "soups", label: "Soups" },
    { id: "manchurian", label: "Manchurian" },
    { id: "chilly", label: "Chilly Dishes" },
    { id: "bhel", label: "Bhel" },
    { id: "rice", label: "Rice" },
    { id: "noodles", label: "Noodles" },
    { id: "momos", label: "Momos" },
  ];

  const filteredItems = activeCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-warm-gradient bg-clip-text text-transparent">
            Our Menu
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow The Road To Flavour
          </p>
        </div>

        {/* Category Navigation */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full justify-start">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="whitespace-nowrap"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <MenuItemCard key={index} item={item} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Menu;