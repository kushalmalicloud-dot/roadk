-- Create enum types for categories and order status
CREATE TYPE meal_category AS ENUM ('starters', 'rice', 'noodles', 'chilly_dishes', 'momos', 'bhel', 'special_items');
CREATE TYPE food_type AS ENUM ('veg', 'non_veg');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE payment_method AS ENUM ('online', 'offline');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category meal_category NOT NULL,
  food_type food_type NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  special_instructions TEXT,
  estimated_pickup_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table reservations
CREATE TABLE public.table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  special_requests TEXT,
  status reservation_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin settings table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for restaurant functionality)
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admin can manage menu items" ON public.menu_items FOR ALL USING (true);

CREATE POLICY "Orders are viewable by everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Order items are viewable by everyone" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Reservations are viewable by everyone" ON public.table_reservations FOR SELECT USING (true);
CREATE POLICY "Anyone can create reservations" ON public.table_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Reservations can be updated" ON public.table_reservations FOR UPDATE USING (true);

CREATE POLICY "Admin settings are viewable by everyone" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Admin settings can be managed" ON public.admin_settings FOR ALL USING (true);

-- Functions for order numbers and timestamps
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.table_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin PIN
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES ('admin_pin', '1234');

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, food_type) VALUES
-- Starters
('Veg Spring Rolls', 'Crispy rolls filled with fresh vegetables', 120.00, 'starters', 'veg'),
('Chicken Wings', 'Spicy grilled chicken wings', 180.00, 'starters', 'non_veg'),
('Paneer Tikka', 'Marinated cottage cheese cubes', 150.00, 'starters', 'veg'),
('Fish Fingers', 'Crispy fried fish strips', 200.00, 'starters', 'non_veg'),

-- Rice
('Veg Fried Rice', 'Stir-fried rice with mixed vegetables', 140.00, 'rice', 'veg'),
('Chicken Fried Rice', 'Aromatic rice with chicken pieces', 160.00, 'rice', 'non_veg'),
('Egg Fried Rice', 'Classic fried rice with scrambled eggs', 130.00, 'rice', 'non_veg'),
('Schezwan Rice', 'Spicy rice with schezwan sauce', 150.00, 'rice', 'veg'),

-- Noodles
('Veg Hakka Noodles', 'Stir-fried noodles with vegetables', 130.00, 'noodles', 'veg'),
('Chicken Noodles', 'Delicious noodles with chicken', 150.00, 'noodles', 'non_veg'),
('Schezwan Noodles', 'Spicy noodles with schezwan flavor', 140.00, 'noodles', 'veg'),

-- Chilly Dishes
('Chilli Paneer', 'Cottage cheese in spicy chilli sauce', 160.00, 'chilly_dishes', 'veg'),
('Chilli Chicken', 'Chicken pieces in hot chilli sauce', 180.00, 'chilly_dishes', 'non_veg'),
('Chilli Fish', 'Fish cubes in tangy chilli gravy', 200.00, 'chilly_dishes', 'non_veg'),

-- Momos
('Veg Momos', 'Steamed dumplings with vegetable filling', 100.00, 'momos', 'veg'),
('Chicken Momos', 'Juicy chicken filled dumplings', 120.00, 'momos', 'non_veg'),
('Fried Momos', 'Crispy fried vegetable momos', 110.00, 'momos', 'veg'),

-- Bhel
('Mumbai Bhel', 'Classic street-style bhel puri', 80.00, 'bhel', 'veg'),
('Sev Puri', 'Crispy puris with chutneys and sev', 90.00, 'bhel', 'veg'),
('Pani Puri', 'Traditional water-filled puris', 70.00, 'bhel', 'veg'),

-- Special Items
('Road Kitchen Special Thali', 'Complete meal with rice, dal, sabzi and more', 250.00, 'special_items', 'veg'),
('Butter Chicken Combo', 'Butter chicken with naan and rice', 300.00, 'special_items', 'non_veg'),
('Tandoori Platter', 'Assorted tandoori items', 350.00, 'special_items', 'non_veg');