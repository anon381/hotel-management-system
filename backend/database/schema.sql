-- =============================================
-- Café X - Complete Database Schema (v2)
-- PostgreSQL / Supabase compatible
-- Covers ALL features: Auth, Menu, Orders, Payments,
-- Reservations, Tables, Inventory, Staff, Customers,
-- Reviews, Loyalty, Feedback, Promotions, Notifications,
-- Schedules, Tags, User Management
-- =============================================

-- ==================== ENUMS ====================

CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'cashier', 'kitchen_staff', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile', 'online');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE public.notification_type AS ENUM ('order', 'reservation', 'promotion', 'system', 'kitchen', 'loyalty', 'feedback');
CREATE TYPE public.inventory_unit AS ENUM ('kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box');
CREATE TYPE public.dish_category AS ENUM ('appetizer', 'main_course', 'dessert', 'beverage', 'side', 'special', 'breakfast', 'lunch', 'dinner');
CREATE TYPE public.membership_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.staff_status AS ENUM ('on_duty', 'on_break', 'off_duty');
CREATE TYPE public.feedback_type AS ENUM ('food', 'service', 'ambiance', 'general');
CREATE TYPE public.promotion_type AS ENUM ('discount_percent', 'discount_fixed', 'free_item', 'bonus_points');

-- ==================== CORE TABLES ====================

-- 1. User Profiles (auto-created on signup)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    membership_tier membership_tier DEFAULT 'bronze',
    total_loyalty_points INT DEFAULT 0,
    lifetime_spent DECIMAL(12, 2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_visits INT DEFAULT 0,
    member_since TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Roles (separate table for security - CRITICAL)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ==================== MENU SYSTEM ====================

-- 3. Menu Categories
CREATE TABLE public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Menu Items (Dishes)
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    emoji TEXT DEFAULT '🍽️',
    category dish_category DEFAULT 'main_course',
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    prep_time_minutes INT DEFAULT 15,
    calories INT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    total_orders INT DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Menu Item Tags (Chef's Special, Healthy, Popular, etc.)
CREATE TABLE public.menu_item_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (menu_item_id, tag)
);

-- ==================== TABLE MANAGEMENT ====================

-- 6. Restaurant Tables
CREATE TABLE public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number TEXT UNIQUE NOT NULL,
    zone TEXT NOT NULL DEFAULT 'Main',
    capacity INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status table_status DEFAULT 'available',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== RESERVATIONS ====================

-- 7. Reservations
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_number TEXT UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_minutes INT DEFAULT 90,
    guest_count INT NOT NULL DEFAULT 2 CHECK (guest_count > 0),
    status reservation_status DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== ORDER SYSTEM ====================

-- 8. Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    estimated_ready_minutes INT,
    actual_ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL, -- denormalized for history
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    is_completed BOOLEAN DEFAULT false, -- kitchen item-level tracking
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== PAYMENTS ====================

-- 10. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    method payment_method DEFAULT 'card',
    status payment_status DEFAULT 'pending',
    transaction_ref TEXT,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== CUSTOMER FEATURES ====================

-- 11. Customer Favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (customer_id, menu_item_id)
);

-- 12. Reviews & Ratings
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Loyalty Points Transactions
CREATE TABLE public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    points INT NOT NULL, -- positive = earned, negative = redeemed
    reason TEXT NOT NULL, -- e.g. "Order #1024", "Welcome bonus", "Redeemed for discount"
    reference_type TEXT, -- 'order', 'promotion', 'manual', 'signup'
    reference_id UUID, -- order_id or promotion_id
    balance_after INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Customer Feedback (separate from item reviews)
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type feedback_type DEFAULT 'general',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INVENTORY ====================

-- 15. Inventory Items
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    sku TEXT UNIQUE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit inventory_unit DEFAULT 'pcs',
    min_quantity DECIMAL(10, 2) DEFAULT 10,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0,
    supplier TEXT,
    supplier_contact TEXT,
    last_restocked TIMESTAMPTZ,
    expiry_date DATE,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity <= min_quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Inventory Restock Log
CREATE TABLE public.inventory_restock_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    quantity_added DECIMAL(10, 2) NOT NULL,
    cost_total DECIMAL(10, 2) DEFAULT 0,
    restocked_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== STAFF MANAGEMENT ====================

-- 17. Staff Members
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL, -- Head Chef, Sous Chef, Manager, Cashier, Waiter, etc.
    email TEXT,
    phone TEXT,
    avatar TEXT,
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    status staff_status DEFAULT 'off_duty',
    is_active BOOLEAN DEFAULT true,
    hired_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Staff Schedules
CREATE TABLE public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 6=Sat
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Staff Attendance / Clock In-Out
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    total_hours DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== PROMOTIONS ====================

-- 20. Promotions & Offers
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type promotion_type DEFAULT 'discount_percent',
    value DECIMAL(10, 2) NOT NULL, -- % or fixed amount or points
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    code TEXT UNIQUE, -- promo code
    max_uses INT,
    current_uses INT DEFAULT 0,
    applicable_items UUID[], -- array of menu_item_ids, null = all items
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Promotion Redemptions
CREATE TABLE public.promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== NOTIFICATIONS ====================

-- 22. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- deep link in the app
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== AUDIT / ACTIVITY LOG ====================

-- 23. Activity Log (tracks important actions for admin)
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'order_created', 'payment_completed', 'menu_item_updated', etc.
    entity_type TEXT NOT NULL, -- 'order', 'menu_item', 'reservation', etc.
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INDEXES ====================

-- Orders
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_table ON public.orders(table_id);

-- Order Items
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON public.order_items(menu_item_id);
CREATE INDEX idx_order_items_incomplete ON public.order_items(order_id) WHERE is_completed = false;

-- Reservations
CREATE INDEX idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX idx_reservations_table_date ON public.reservations(table_id, reservation_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);

-- Notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(user_id, type);

-- Menu
CREATE INDEX idx_menu_items_category ON public.menu_items(category);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX idx_menu_items_featured ON public.menu_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_item_tags_item ON public.menu_item_tags(menu_item_id);
CREATE INDEX idx_menu_item_tags_tag ON public.menu_item_tags(tag);

-- Favorites
CREATE INDEX idx_favorites_customer ON public.favorites(customer_id);
CREATE INDEX idx_favorites_item ON public.favorites(menu_item_id);

-- Reviews
CREATE INDEX idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX idx_reviews_menu_item ON public.reviews(menu_item_id);
CREATE INDEX idx_reviews_order ON public.reviews(order_id);

-- Loyalty
CREATE INDEX idx_loyalty_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_created ON public.loyalty_transactions(created_at DESC);

-- Feedback
CREATE INDEX idx_feedback_customer ON public.feedback(customer_id);
CREATE INDEX idx_feedback_unresolved ON public.feedback(is_resolved) WHERE is_resolved = false;

-- Inventory
CREATE INDEX idx_inventory_low ON public.inventory(is_low_stock) WHERE is_low_stock = true;
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date) WHERE expiry_date IS NOT NULL;

-- Payments
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);

-- Staff
CREATE INDEX idx_staff_user ON public.staff(user_id);
CREATE INDEX idx_staff_active ON public.staff(is_active) WHERE is_active = true;
CREATE INDEX idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX idx_staff_attendance_staff ON public.staff_attendance(staff_id);

-- Promotions
CREATE INDEX idx_promotions_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_code ON public.promotions(code);
CREATE INDEX idx_promotion_redemptions_customer ON public.promotion_redemptions(customer_id);
CREATE INDEX idx_promotion_redemptions_promo ON public.promotion_redemptions(promotion_id);

-- Activity Log
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);

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

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'manager')
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
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );

  -- Default role: customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  -- Welcome bonus loyalty points
  INSERT INTO public.loyalty_transactions (customer_id, points, reason, reference_type, balance_after)
  VALUES (NEW.id, 200, 'Welcome bonus', 'signup', 200);

  -- Update profile points
  UPDATE public.profiles SET total_loyalty_points = 200 WHERE id = NEW.id;

  -- Welcome notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.id, 'loyalty', 'Welcome to Café X! 🎉', 'You''ve earned 200 welcome bonus points. Start ordering to earn more!');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate order totals
CREATE OR REPLACE FUNCTION public.calculate_order_total(_order_id UUID)
RETURNS VOID AS $$
DECLARE
  _subtotal DECIMAL(10,2);
  _discount DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO _subtotal
  FROM public.order_items WHERE order_id = _order_id;

  SELECT COALESCE(discount, 0) INTO _discount
  FROM public.orders WHERE id = _order_id;

  UPDATE public.orders
  SET subtotal = _subtotal,
      tax = ROUND((_subtotal - _discount) * 0.08, 2),
      total = ROUND((_subtotal - _discount) * 1.08, 2),
      updated_at = now()
  WHERE id = _order_id;
END;
$$ LANGUAGE plpgsql;

-- Award loyalty points for an order (1 point per $1)
CREATE OR REPLACE FUNCTION public.award_loyalty_points(_order_id UUID)
RETURNS VOID AS $$
DECLARE
  _customer_id UUID;
  _total DECIMAL(10,2);
  _points INT;
  _current_points INT;
  _new_balance INT;
BEGIN
  SELECT customer_id, total INTO _customer_id, _total
  FROM public.orders WHERE id = _order_id;

  IF _customer_id IS NULL THEN RETURN; END IF;

  _points := FLOOR(_total); -- 1 point per $1

  SELECT total_loyalty_points INTO _current_points
  FROM public.profiles WHERE id = _customer_id;

  _new_balance := COALESCE(_current_points, 0) + _points;

  INSERT INTO public.loyalty_transactions (customer_id, points, reason, reference_type, reference_id, balance_after)
  VALUES (_customer_id, _points, 'Order #' || (SELECT order_number FROM public.orders WHERE id = _order_id), 'order', _order_id, _new_balance);

  UPDATE public.profiles
  SET total_loyalty_points = _new_balance,
      lifetime_spent = lifetime_spent + _total,
      total_orders = total_orders + 1,
      membership_tier = CASE
        WHEN (lifetime_spent + _total) >= 5000 THEN 'platinum'
        WHEN (lifetime_spent + _total) >= 2000 THEN 'gold'
        WHEN (lifetime_spent + _total) >= 500 THEN 'silver'
        ELSE 'bronze'
      END,
      updated_at = now()
  WHERE id = _customer_id;

  -- Notify customer
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (_customer_id, 'loyalty', 'Points Earned! 🎉',
    'You earned ' || _points || ' points from your order.',
    jsonb_build_object('order_id', _order_id, 'points', _points));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update menu item average rating after a review
CREATE OR REPLACE FUNCTION public.update_menu_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews
    WHERE menu_item_id = NEW.menu_item_id AND is_visible = true
  ),
  review_count = (
    SELECT COUNT(*) FROM public.reviews
    WHERE menu_item_id = NEW.menu_item_id AND is_visible = true
  ),
  updated_at = now()
  WHERE id = NEW.menu_item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate reservation number
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reservation_number := 'R-' || LPAD(nextval('reservation_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dashboard stats function (for admin)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_orders_today', (SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE),
    'revenue_today', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at::date = CURRENT_DATE AND status != 'cancelled'),
    'available_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE status = 'available' AND is_active = true),
    'total_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE is_active = true),
    'orders_preparing', (SELECT COUNT(*) FROM orders WHERE status = 'preparing'),
    'orders_ready', (SELECT COUNT(*) FROM orders WHERE status = 'ready'),
    'orders_pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'avg_order_value', (SELECT ROUND(COALESCE(AVG(total), 0), 2) FROM orders WHERE created_at::date = CURRENT_DATE AND status != 'cancelled'),
    'total_customers', (SELECT COUNT(*) FROM profiles),
    'low_stock_count', (SELECT COUNT(*) FROM inventory WHERE is_low_stock = true),
    'pending_reservations', (SELECT COUNT(*) FROM reservations WHERE status = 'pending'),
    'active_staff', (SELECT COUNT(*) FROM staff WHERE status = 'on_duty'),
    'pending_feedback', (SELECT COUNT(*) FROM feedback WHERE is_resolved = false)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== SEQUENCES ====================

CREATE SEQUENCE IF NOT EXISTS reservation_number_seq START WITH 100;

-- ==================== TRIGGERS ====================

-- Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Reviews → update menu item rating
CREATE TRIGGER on_review_created AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_menu_item_rating();
CREATE TRIGGER on_review_updated AFTER UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_menu_item_rating();

-- Reservation number
CREATE TRIGGER on_reservation_created BEFORE INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.generate_reservation_number();

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_restock_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- PROFILES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- USER ROLES (admin only for write, users can read their own)
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- MENU ITEMS (public read)
CREATE POLICY "Anyone can view available menu" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage menu items" ON public.menu_items FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Kitchen staff manage menu items" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

-- MENU CATEGORIES
CREATE POLICY "Anyone can view categories" ON public.menu_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.menu_categories FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- MENU ITEM TAGS
CREATE POLICY "Anyone can view tags" ON public.menu_item_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tags" ON public.menu_item_tags FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Kitchen manage tags" ON public.menu_item_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

-- RESTAURANT TABLES
CREATE POLICY "Anyone can view tables" ON public.restaurant_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RESERVATIONS
CREATE POLICY "Customers view own reservations" ON public.reservations FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own reservations" ON public.reservations FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins manage all reservations" ON public.reservations FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- ORDERS
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Kitchen view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Kitchen update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Cashier view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'cashier'));
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- ORDER ITEMS
CREATE POLICY "View own order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Create own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Kitchen view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Kitchen update order items" ON public.order_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- PAYMENTS
CREATE POLICY "View own payments" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Cashier manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'cashier'));
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- FAVORITES
CREATE POLICY "View own favorites" ON public.favorites FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Manage own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (customer_id = auth.uid());

-- REVIEWS
CREATE POLICY "Anyone can view visible reviews" ON public.reviews FOR SELECT TO authenticated USING (is_visible = true);
CREATE POLICY "Customers create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- LOYALTY TRANSACTIONS
CREATE POLICY "View own loyalty" ON public.loyalty_transactions FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins view all loyalty" ON public.loyalty_transactions FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "System insert loyalty" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (true); -- controlled via functions

-- FEEDBACK
CREATE POLICY "Customers create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "View own feedback" ON public.feedback FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- INVENTORY (admin/kitchen only)
CREATE POLICY "Kitchen view inventory" ON public.inventory FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- INVENTORY RESTOCK LOG
CREATE POLICY "Admins manage restock log" ON public.inventory_restock_log FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Kitchen view restock log" ON public.inventory_restock_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

-- STAFF
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Staff view own record" ON public.staff FOR SELECT TO authenticated USING (user_id = auth.uid());

-- STAFF SCHEDULES
CREATE POLICY "Admins manage schedules" ON public.staff_schedules FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Staff view own schedule" ON public.staff_schedules FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = staff_id AND user_id = auth.uid())
);

-- STAFF ATTENDANCE
CREATE POLICY "Admins manage attendance" ON public.staff_attendance FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Staff view own attendance" ON public.staff_attendance FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = staff_id AND user_id = auth.uid())
);

-- PROMOTIONS
CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage promotions" ON public.promotions FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- PROMOTION REDEMPTIONS
CREATE POLICY "View own redemptions" ON public.promotion_redemptions FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins view all redemptions" ON public.promotion_redemptions FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ACTIVITY LOG
CREATE POLICY "Admins view activity log" ON public.activity_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==================== SEED DATA (optional) ====================

-- Insert default menu categories
INSERT INTO public.menu_categories (name, display_order) VALUES
  ('Breakfast', 1), ('Lunch', 2), ('Dinner', 3),
  ('Drinks', 4), ('Desserts', 5), ('Sides', 6), ('Specials', 7);

-- Insert default tables
INSERT INTO public.restaurant_tables (table_number, zone, capacity) VALUES
  ('T-01', 'Window', 2), ('T-02', 'Main', 4), ('T-03', 'Main', 4),
  ('T-04', 'Main', 4), ('T-05', 'VIP', 6), ('T-06', 'VIP', 6),
  ('T-07', 'Main', 4), ('T-08', 'Patio', 2), ('T-09', 'Patio', 4),
  ('T-10', 'Private', 8), ('T-11', 'Window', 2), ('T-12', 'Window', 4),
  ('W1', 'Window', 2), ('W2', 'Window', 2), ('W3', 'Window', 4), ('W4', 'Window', 4),
  ('P1', 'Patio', 4), ('P2', 'Patio', 4), ('P3', 'Patio', 6),
  ('V1', 'VIP', 6), ('V2', 'VIP', 8),
  ('M1', 'Main', 2), ('M2', 'Main', 4), ('M3', 'Main', 4), ('M4', 'Main', 6), ('M5', 'Main', 8);
