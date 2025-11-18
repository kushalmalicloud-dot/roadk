import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Clock, DollarSign, User, Phone, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{menuItemId: string, quantity: number, searchQuery: string}[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    paymentMethod: "qr_code",
    specialInstructions: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === "customerName") {
      // Allow only alphabets and spaces
      const regex = /^[a-zA-Z\s]*$/;
      if (regex.test(value)) {
        setNewOrder({ ...newOrder, [id]: value });
      }
    } else if (id === "customerPhone") {
      // Allow only 10 digits
      const regex = /^[0-9]{0,10}$/;
      if (regex.test(value)) {
        setNewOrder({ ...newOrder, [id]: value });
      }
    } else {
      setNewOrder({ ...newOrder, [id]: value });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
      
      if (error) throw error;

      if (data) {
        const uniqueMenuItems = data.filter((item, index, self) =>
          index === self.findIndex((t) => (
            t.id === item.id
          ))
        );
        setMenuItems(uniqueMenuItems);
      }
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      // Admin sees all orders, especially pending ones that need confirmation
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            special_requests
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Orders",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`
      });
      
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Order Deleted",
        description: "Order has been successfully deleted"
      });
      
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.customerPhone || selectedItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer details and add at least one item",
        variant: "destructive"
      });
      return;
    }

    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(newOrder.customerName)) {
      toast({
        title: "Invalid Customer Name",
        description: "Customer name should only contain alphabets and spaces",
        variant: "destructive"
      });
      return;
    }

    if (newOrder.customerPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be 10 digits",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate total
      let totalAmount = 0;
      const orderItemsData = selectedItems.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;
        return {
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: menuItem.price,
          special_requests: menuItem.name
        };
      });

      const gst = totalAmount * 0.05;
      totalAmount += gst;

      // Generate order number
      const orderNumber = `RK${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: newOrder.customerName,
          customer_phone: `+91${newOrder.customerPhone}`,
          customer_email: newOrder.customerEmail || null,
          total_amount: totalAmount,
          payment_method: newOrder.paymentMethod as 'qr_code' | 'cash' | 'card',
          special_instructions: newOrder.specialInstructions || null,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const itemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        order_id: orderData.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Created",
        description: `Order ${orderNumber} has been created successfully`
      });

      // Reset form
      setNewOrder({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        paymentMethod: "qr_code",
        specialInstructions: ""
      });
      setSelectedItems([]);
      setIsDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error Creating Order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addMenuItem = () => {
    setSelectedItems([...selectedItems, { menuItemId: "", quantity: 1, searchQuery: "" }]);
  };

  const updateSelectedItem = (index: number, field: 'menuItemId' | 'quantity' | 'searchQuery', value: string | number) => {
    const updated = [...selectedItems];
    if (field === 'menuItemId') {
      const menuItem = menuItems.find(m => m.id === value);
      if (menuItem) {
        updated[index] = { ...updated[index], [field]: value, searchQuery: menuItem.name };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSelectedItems(updated);
  };

  const removeSelectedItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading orders...</div>;
  }

  const orders_display = [
    {
      id: 1,
      order_number: "RK20250129001",
      customer_name: "Alice Brown",
      customer_phone: "(555) 111-2222",
      total_amount: 89.50,
      status: "preparing",
      payment_status: "paid",
      payment_method: "qr_code",
      created_at: "2025-01-29T18:30:00Z",
      items: [
        { name: "Dry-Aged Ribeye", quantity: 1, price: 48.00 },
        { name: "Pan-Seared Scallops", quantity: 2, price: 18.00 },
        { name: "Dark Chocolate Soufflé", quantity: 1, price: 14.00 }
      ]
    },
    {
      id: 2,
      order_number: "RK20250129002",
      customer_name: "Bob Wilson",
      customer_phone: "(555) 333-4444",
      total_amount: 64.00,
      status: "ready",
      payment_status: "paid",
      payment_method: "cash",
      created_at: "2025-01-29T19:00:00Z",
      items: [
        { name: "Grilled Atlantic Salmon", quantity: 2, price: 32.00 }
      ]
    },
    {
      id: 3,
      order_number: "RK20250129003",
      customer_name: "Carol Davis",
      customer_phone: "(555) 555-6666",
      total_amount: 123.00,
      status: "confirmed",
      payment_status: "pending",
      payment_method: "qr_code",
      created_at: "2025-01-29T19:15:00Z",
      items: [
        { name: "Duck Confit", quantity: 2, price: 36.00 },
        { name: "Truffle Arancini", quantity: 3, price: 16.00 },
        { name: "Crème Brûlée", quantity: 3, price: 12.00 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();
    const phoneMatch = order.customer_phone?.replace('+91', '').includes(searchTerm);

    return (
      order.order_number?.toLowerCase().includes(searchTermLower) ||
      order.customer_name?.toLowerCase().includes(searchTermLower) ||
      phoneMatch
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
          <p className="text-muted-foreground">Review and confirm customer orders</p>
          <p className="text-sm text-amber-600 mt-1">⚠️ Orders must be confirmed before kitchen can see them</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Add a new order manually for walk-in customers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newOrder.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={newOrder.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newOrder.customerEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={newOrder.paymentMethod} onValueChange={(value) => setNewOrder({...newOrder, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr_code">QR Code</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Order Items *</Label>
                {selectedItems.map((item, index) => {
                  const filteredMenuItems = menuItems.filter(menuItem =>
                    menuItem.name.toLowerCase().includes(item.searchQuery.toLowerCase())
                  );

                  return (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Command>
                          <CommandInput
                            placeholder="Search for a dish..."
                            value={item.searchQuery}
                            onValueChange={(value) => updateSelectedItem(index, 'searchQuery', value)}
                          />
                          <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                              {filteredMenuItems.map(menuItem => (
                                <CommandItem
                                  key={menuItem.id}
                                  onSelect={() => updateSelectedItem(index, 'menuItemId', menuItem.id)}
                                >
                                  {menuItem.name} - ₹{menuItem.price}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSelectedItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                        />
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeSelectedItem(index)}>
                        Remove
                      </Button>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={addMenuItem}>
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  value={newOrder.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special requests..."
                />
              </div>

              <Button onClick={handleCreateOrder} className="w-full">
                Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{order.order_number}</h3>
                        {order.table_number && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            Table {order.table_number}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {order.customer_name}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {order.customer_phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${order.total_amount.toFixed(2)} ({order.payment_method.replace('_', ' ')})
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-start text-sm bg-muted/30 p-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.quantity}x {item.special_requests || 'Item'}</span>
                          </div>
                          <span className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.special_instructions && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950 rounded text-sm">
                        <span className="font-medium">Special Instructions: </span>
                        <span className="text-muted-foreground">{order.special_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      ✓ Confirm Order
                    </Button>
                  )}
                  {order.status !== 'pending' && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newStatus = order.status === 'confirmed' ? 'preparing' :
                                         order.status === 'preparing' ? 'ready' : 'completed';
                        updateOrderStatus(order.id, newStatus);
                      }}
                    >
                      Next Status
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                  {(order.status === 'completed' || order.status === 'cancelled') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete order {order.order_number}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button size="sm" variant="outline">Print Receipt</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;