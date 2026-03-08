-- =============================================
-- Café X - Complete Database Schema
-- PostgreSQL / Supabase compatible
-- =============================================

-- ==================== ENUMS ====================

CREATE TYPE public.app_role AS ENUM ('admin', 'kitchen_staff', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile', 'online');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE public.notification_type AS ENUM ('order', 'reservation', 'promotion', 'system', 'kitchen');
CREATE TYPE public.inventory_unit AS ENUM ('kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box');
CREATE TYPE public.dish_category AS ENUM ('appetizer', 'main_course', 'dessert', 'beverage', 'side', 'special');

-- ==================== TABLES ====================

-- Users / Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles (separate table for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Menu Categories
CREATE TABLE public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu Items (Dishes)
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category dish_category DEFAULT 'main_course',
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    prep_time_minutes INT DEFAULT 15,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Restaurant Tables
CREATE TABLE public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INT UNIQUE NOT NULL,
    zone TEXT NOT NULL DEFAULT 'main',
    capacity INT NOT NULL DEFAULT 4,
    status table_status DEFAULT 'available',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservations
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    guest_count INT NOT NULL DEFAULT 2,
    status reservation_status DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method payment_method DEFAULT 'card',
    status payment_status DEFAULT 'pending',
    transaction_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (customer_id, menu_item_id)
);

-- Inventory
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit inventory_unit DEFAULT 'pcs',
    min_quantity DECIMAL(10, 2) DEFAULT 10,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0,
    supplier TEXT,
    last_restocked TIMESTAMPTZ,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity <= min_quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    shift TEXT DEFAULT 'morning',
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    hired_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX idx_favorites_customer ON public.favorites(customer_id);
CREATE INDEX idx_inventory_low ON public.inventory(is_low_stock) WHERE is_low_stock = true;
CREATE INDEX idx_payments_order ON public.payments(order_id);

-- ==================== FUNCTIONS ====================

-- Role check (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate order totals
CREATE OR REPLACE FUNCTION public.calculate_order_total(_order_id UUID)
RETURNS VOID AS $$
DECLARE
  _subtotal DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO _subtotal
  FROM public.order_items WHERE order_id = _order_id;
  
  UPDATE public.orders
  SET subtotal = _subtotal,
      tax = ROUND(_subtotal * 0.08, 2),
      total = ROUND(_subtotal * 1.08, 2),
      updated_at = now()
  WHERE id = _order_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==================== RLS POLICIES ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Menu Items (public read, admin/kitchen write)
CREATE POLICY "Anyone can view menu" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage menu" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Kitchen can manage menu" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

-- Menu Categories
CREATE POLICY "Anyone can view categories" ON public.menu_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.menu_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tables (public read, admin write)
CREATE POLICY "Anyone can view tables" ON public.restaurant_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reservations
CREATE POLICY "Customers view own reservations" ON public.reservations FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can cancel own" ON public.reservations FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins manage all reservations" ON public.reservations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Kitchen can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Kitchen can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order Items
CREATE POLICY "View own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Kitchen view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Create own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "View own payments" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Favorites
CREATE POLICY "View own favorites" ON public.favorites FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Manage own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (customer_id = auth.uid());

-- Inventory (admin/kitchen only)
CREATE POLICY "Kitchen can view inventory" ON public.inventory FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Staff (admin only)
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
