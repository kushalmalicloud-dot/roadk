import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Cart = () => {
  const { cart, totalAmount, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    specialInstructions: ""
  });

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and phone number",
        variant: "destructive"
      });
      return;
    }

    if (customerInfo.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerInfo.name,
          customer_phone: `+91${customerInfo.phone}`,
          customer_email: customerInfo.email || null,
          special_instructions: customerInfo.specialInstructions || null,
          total_amount: totalAmount,
          payment_method: 'qr_code',
          payment_status: 'pending',
          status: 'pending',
          table_number: tableNumber ? parseInt(tableNumber) : null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: null,
        quantity: item.quantity,
        price: item.price,
        special_requests: item.portion ? `${item.portion} portion - ${item.name}` : item.name
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed Successfully!",
        description: `Your order number is ${orderNumber}. We'll prepare it shortly.`
      });

      clearCart();
      setIsCheckoutOpen(false);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={tableNumber ? `/?table=${tableNumber}` : "/"} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Menu</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">My Cart</h1>
              {tableNumber && (
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  Table {tableNumber}
                </span>
              )}
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
            <ShoppingCart className="h-24 w-24 mb-6 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-lg mb-6">Add items from the menu to get started</p>
            <Link to={tableNumber ? `/?table=${tableNumber}` : "/"}>
              <Button size="lg">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{totalItems} Items in Cart</h2>
                <Button variant="outline" onClick={clearCart}>
                  Clear All
                </Button>
              </div>

              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          {item.foodType === "veg" && (
                            <span className="w-5 h-5 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                            </span>
                          )}
                          {item.foodType === "non-veg" && (
                            <span className="w-5 h-5 border-2 border-red-500 flex items-center justify-center flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            </span>
                          )}
                          {item.foodType === "egg" && (
                            <span className="w-5 h-5 border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                        
                        {item.portion && (
                          <p className="text-sm text-muted-foreground capitalize mb-2">
                            {item.portion} Portion
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-9 w-9"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold text-lg">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-9 w-9"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto"
                          >
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">All prices are inclusive of GST</p>
                  </div>
                  
                  <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Your Order</DialogTitle>
                        <DialogDescription>
                          Please provide your details to complete the order
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <div className="flex gap-2">
                            <Input
                              value="+91"
                              disabled
                              className="w-16"
                            />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Enter 10-digit phone number"
                              value={customerInfo.phone}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 10) {
                                  setCustomerInfo({...customerInfo, phone: value});
                                }
                              }}
                              maxLength={10}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                          <Textarea
                            id="instructions"
                            placeholder="Any special requests..."
                            value={customerInfo.specialInstructions}
                            onChange={(e) => setCustomerInfo({...customerInfo, specialInstructions: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckout}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Placing Order..." : "Place Order"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Link to={tableNumber ? `/?table=${tableNumber}` : "/"}>
                    <Button variant="outline" className="w-full mt-3" size="lg">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
