import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    time: "",
    partySize: "",
    specialRequests: ""
  });

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Check if selected date is today
  const isToday = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get minimum time based on selected date
  const getMinTime = () => {
    return isToday(selectedDate) ? getCurrentTime() : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.phone || !selectedDate || !formData.time || !formData.partySize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('table_reservations')
        .insert({
          customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
          customer_email: formData.email || null,
          customer_phone: `+91${formData.phone}`,
          reservation_date: format(selectedDate, 'yyyy-MM-dd'),
          reservation_time: formData.time,
          party_size: parseInt(formData.partySize),
          special_requests: formData.specialRequests || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Reservation Requested!",
        description: "We'll confirm your reservation shortly."
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        time: "",
        partySize: "",
        specialRequests: ""
      });
      setSelectedDate(undefined);
    } catch (error: any) {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-warm-gradient bg-clip-text text-transparent">
            Visit Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience exceptional dining in the heart of the city
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-primary">Location & Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Address</h4>
                  <p className="text-muted-foreground">
                    123 Culinary Street<br />
                    Downtown District<br />
                    New York, NY 10001
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <p className="text-muted-foreground">hello@theroadkitchen.com</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Hours</h4>
                  <div className="text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Thursday</span>
                      <span>5:00 PM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday - Saturday</span>
                      <span>5:00 PM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>4:00 PM - 9:00 PM</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-primary rounded-lg p-4">
                  <h4 className="font-semibold text-background mb-2">Payment Options</h4>
                  <div className="text-background/90 space-y-2">
                    <p className="text-sm">💳 Pay with QR Code at your table</p>
                    <p className="text-sm">💰 Cash accepted</p>
                    <p className="text-sm">💳 Card payments available</p>
                    <p className="text-xs text-background/70 mt-2">
                      Scan the QR code at your table for quick and secure payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservation Form */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-primary">Make a Reservation</CardTitle>
                <CardDescription>
                  Book your table for an unforgettable dining experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                    <Input 
                      placeholder="Last Name" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                  
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Input
                      value="+91"
                      disabled
                      className="w-16"
                    />
                    <Input 
                      type="tel" 
                      placeholder="Enter 10-digit phone number" 
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setFormData({...formData, phone: value});
                        }
                      }}
                      maxLength={10}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input 
                      type="time" 
                      placeholder="Select time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      min={getMinTime()}
                      required
                    />
                  </div>
                  
                  <Input 
                    type="number" 
                    placeholder="Number of Guests" 
                    min="1" 
                    value={formData.partySize}
                    onChange={(e) => setFormData({...formData, partySize: e.target.value})}
                    required
                  />
                  
                  <Textarea 
                    placeholder="Special requests or dietary restrictions..."
                    className="resize-none"
                    rows={3}
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  />
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Booking..." : "Book Table"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;