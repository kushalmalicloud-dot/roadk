import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar as CalendarIcon, Clock, Users, Phone, Mail, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Reservations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [newReservation, setNewReservation] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    reservationDate: undefined as Date | undefined,
    reservationTime: "",
    partySize: 2,
    specialRequests: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'table_reservations' }, 
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Reservations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: 'confirmed' | 'cancelled' | 'pending' | 'completed') => {
    try {
      const { error } = await supabase
        .from('table_reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Reservation ${newStatus}`
      });
      
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('table_reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Reservation Deleted",
        description: "Reservation has been removed successfully"
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateReservation = async () => {
    if (!newReservation.customerName || !newReservation.customerPhone || !newReservation.reservationDate || !newReservation.reservationTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (newReservation.customerPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('table_reservations')
        .insert({
          customer_name: newReservation.customerName,
          customer_phone: `+91${newReservation.customerPhone}`,
          customer_email: newReservation.customerEmail || null,
          reservation_date: format(newReservation.reservationDate, 'yyyy-MM-dd'),
          reservation_time: newReservation.reservationTime,
          party_size: newReservation.partySize,
          special_requests: newReservation.specialRequests || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Reservation Created",
        description: "New reservation has been added successfully"
      });

      // Reset form
      setNewReservation({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        reservationDate: undefined,
        reservationTime: "",
        partySize: 2,
        specialRequests: ""
      });
      setIsDialogOpen(false);
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditReservation = async () => {
    if (!editingReservation) return;

    if (!editingReservation.customer_name || !editingReservation.customer_phone || !editingReservation.reservationDate || !editingReservation.reservation_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('table_reservations')
        .update({
          customer_name: editingReservation.customer_name,
          customer_phone: editingReservation.customer_phone,
          customer_email: editingReservation.customer_email || null,
          reservation_date: editingReservation.reservationDate instanceof Date 
            ? format(editingReservation.reservationDate, 'yyyy-MM-dd')
            : editingReservation.reservationDate,
          reservation_time: editingReservation.reservation_time,
          party_size: editingReservation.party_size,
          special_requests: editingReservation.special_requests || null
        })
        .eq('id', editingReservation.id);

      if (error) throw error;

      toast({
        title: "Reservation Updated",
        description: "Reservation has been updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (reservation: any) => {
    setEditingReservation({
      ...reservation,
      reservationDate: new Date(reservation.reservation_date)
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading reservations...</div>;
  }

  const reservations_display = [
    {
      id: 1,
      customer_name: "John Smith",
      customer_email: "john@example.com",
      customer_phone: "(555) 123-4567",
      reservation_date: "2025-01-30",
      reservation_time: "19:00",
      party_size: 4,
      status: "confirmed",
      special_requests: "Anniversary dinner"
    },
    {
      id: 2,
      customer_name: "Sarah Johnson",
      customer_email: "sarah@example.com",
      customer_phone: "(555) 987-6543",
      reservation_date: "2025-01-30",
      reservation_time: "20:30",
      party_size: 2,
      status: "pending",
      special_requests: null
    },
    {
      id: 3,
      customer_name: "Mike Davis",
      customer_email: "mike@example.com",
      customer_phone: "(555) 456-7890",
      reservation_date: "2025-01-31",
      reservation_time: "18:00",
      party_size: 6,
      status: "confirmed",
      special_requests: "Vegetarian options needed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.customer_phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          <p className="text-muted-foreground">Manage table bookings and reservations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Reservation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Reservation</DialogTitle>
              <DialogDescription>Add a reservation for walk-in or phone customers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newReservation.customerName}
                  onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <div className="flex gap-2">
                  <Input
                    value="+91"
                    disabled
                    className="w-16"
                  />
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={newReservation.customerPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setNewReservation({...newReservation, customerPhone: value});
                      }
                    }}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newReservation.customerEmail}
                  onChange={(e) => setNewReservation({...newReservation, customerEmail: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reservationDate">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newReservation.reservationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReservation.reservationDate ? (
                          format(newReservation.reservationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newReservation.reservationDate}
                        onSelect={(date) => setNewReservation({...newReservation, reservationDate: date})}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationTime">Time *</Label>
                  <Input
                    id="reservationTime"
                    type="time"
                    value={newReservation.reservationTime}
                    onChange={(e) => setNewReservation({...newReservation, reservationTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partySize">Party Size *</Label>
                <Input
                  id="partySize"
                  type="number"
                  min="1"
                  value={newReservation.partySize}
                  onChange={(e) => setNewReservation({...newReservation, partySize: parseInt(e.target.value) || 2})}
                  placeholder="Number of guests"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={newReservation.specialRequests}
                  onChange={(e) => setNewReservation({...newReservation, specialRequests: e.target.value})}
                  placeholder="Any special requests..."
                />
              </div>
              <Button onClick={handleCreateReservation} className="w-full">
                Create Reservation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{reservation.customer_name}</h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(reservation.reservation_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {reservation.reservation_time}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {reservation.party_size} guests
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {reservation.customer_phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {reservation.customer_email}
                    </div>
                  </div>

                  {reservation.special_requests && (
                    <div className="text-sm">
                      <span className="font-medium">Special Requests: </span>
                      <span className="text-muted-foreground">{reservation.special_requests}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(reservation)}>Edit</Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                    disabled={reservation.status === 'confirmed'}
                  >
                    Confirm
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                    disabled={reservation.status === 'cancelled'}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
      </div>

      {/* Edit Reservation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>Update reservation details</DialogDescription>
          </DialogHeader>
          {editingReservation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCustomerName">Customer Name *</Label>
                <Input
                  id="editCustomerName"
                  value={editingReservation.customer_name}
                  onChange={(e) => setEditingReservation({...editingReservation, customer_name: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerPhone">Phone Number *</Label>
                <Input
                  id="editCustomerPhone"
                  type="tel"
                  value={editingReservation.customer_phone}
                  onChange={(e) => setEditingReservation({...editingReservation, customer_phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerEmail">Email (Optional)</Label>
                <Input
                  id="editCustomerEmail"
                  type="email"
                  value={editingReservation.customer_email || ""}
                  onChange={(e) => setEditingReservation({...editingReservation, customer_email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editReservationDate">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingReservation.reservationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingReservation.reservationDate ? (
                          format(editingReservation.reservationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingReservation.reservationDate}
                        onSelect={(date) => setEditingReservation({...editingReservation, reservationDate: date})}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editReservationTime">Time *</Label>
                  <Input
                    id="editReservationTime"
                    type="time"
                    value={editingReservation.reservation_time}
                    onChange={(e) => setEditingReservation({...editingReservation, reservation_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPartySize">Party Size *</Label>
                <Input
                  id="editPartySize"
                  type="number"
                  min="1"
                  value={editingReservation.party_size}
                  onChange={(e) => setEditingReservation({...editingReservation, party_size: parseInt(e.target.value) || 2})}
                  placeholder="Number of guests"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="editSpecialRequests"
                  value={editingReservation.special_requests || ""}
                  onChange={(e) => setEditingReservation({...editingReservation, special_requests: e.target.value})}
                  placeholder="Any special requests..."
                />
              </div>
              <Button onClick={handleEditReservation} className="w-full">
                Update Reservation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;