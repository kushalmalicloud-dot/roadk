import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ShoppingBag, Users, TrendingUp, Clock, AlertCircle, ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    todayReservations: 0,
    totalCustomers: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .subscribe();

    const reservationsChannel = supabase
      .channel('dashboard-reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_reservations' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(reservationsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Get pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get today's reservations
      const today = new Date().toISOString().split('T')[0];
      const { count: reservationCount } = await supabase
        .from('table_reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', today);

      // Get total orders (as customer proxy)
      const { count: customerCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get today's revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      const revenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        pendingOrders: pendingCount || 0,
        todayReservations: reservationCount || 0,
        totalCustomers: customerCount || 0,
        todayRevenue: revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your restaurant operations</p>
      </div>

      {stats.pendingOrders > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">
              You have <strong>{stats.pendingOrders}</strong> pending order(s) waiting for confirmation.
            </p>
            <Link to="/admin/orders">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                Review Pending Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Reservations
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayReservations}</div>
              <p className="text-xs text-muted-foreground">
                Tables booked today
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/kitchen">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kitchen View
              </CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Orders in progress
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated today
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
