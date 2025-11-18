import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Kitchen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchKitchenOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('kitchen-orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchKitchenOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      // Only show confirmed, preparing, and ready orders to kitchen
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
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

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

  const updateOrderStatus = async (orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Order marked as ${newStatus}`
      });
      
      fetchKitchenOrders();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ChefHat className="h-8 w-8 animate-pulse" />
        <span className="ml-2">Loading kitchen orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kitchen View</h2>
          <p className="text-muted-foreground">Orders ready for preparation</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No orders to prepare</p>
            <p className="text-sm text-muted-foreground mt-2">Orders will appear here once confirmed by admin</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kitchen View</h2>
          <p className="text-muted-foreground">{orders.length} order(s) in queue</p>
        </div>
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6" />
          <span className="font-semibold">Chef Dashboard</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-semibold text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                </div>

                {/* Order Items */}
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <ChefHat className="h-4 w-4 mr-1" />
                    Items to Prepare:
                  </h4>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="bg-background rounded p-2 border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              <span className="inline-block bg-primary text-primary-foreground rounded-full w-6 h-6 text-center text-xs leading-6 mr-2">
                                {item.quantity}
                              </span>
                              {item.special_requests || 'Item'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Special Instructions:
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {order.special_instructions}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full"
                      variant="outline"
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Kitchen;
