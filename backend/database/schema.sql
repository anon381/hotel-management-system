-- =============================================
-- Café X - Complete Database Schema (v3 - FINAL)
-- PostgreSQL / Supabase compatible
-- 26 tables, full RLS, triggers, functions, seed data
-- Covers: Auth, Menu, Orders, Payments, Reservations,
-- Tables, Inventory, Staff, Customers, Reviews, Loyalty,
-- Feedback, Promotions, Notifications, Schedules, Tags,
-- User Management, Activity Logs, Coupons, Delivery,
-- Menu Ingredients, Kitchen Stations
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
CREATE TYPE public.order_type AS ENUM ('dine_in', 'takeaway', 'delivery');

-- ==================== CORE TABLES ====================

-- 1. User Profiles (auto-created on signup)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    preferences JSONB DEFAULT '{}',  -- dietary prefs, language, etc.
    membership_tier membership_tier DEFAULT 'bronze',
    total_loyalty_points INT DEFAULT 0,
    lifetime_spent DECIMAL(12, 2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_visits INT DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
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
    icon_emoji TEXT DEFAULT '🍽️',
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
    compare_price DECIMAL(10, 2),  -- original price for sale items
    image_url TEXT,
    emoji TEXT DEFAULT '🍽️',
    category dish_category DEFAULT 'main_course',
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    is_halal BOOLEAN DEFAULT false,
    allergens TEXT[],  -- array of allergens: nuts, dairy, shellfish, etc.
    prep_time_minutes INT DEFAULT 15,
    calories INT,
    protein_g DECIMAL(5,1),
    carbs_g DECIMAL(5,1),
    fat_g DECIMAL(5,1),
    serving_size TEXT,  -- e.g. "250g", "1 plate"
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

-- 6. Menu Item Ingredients (links menu items to inventory)
CREATE TABLE public.menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID,
    ingredient_name TEXT NOT NULL,
    quantity_needed DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit inventory_unit DEFAULT 'g',
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== TABLE MANAGEMENT ====================

-- 7. Restaurant Tables
CREATE TABLE public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number TEXT UNIQUE NOT NULL,
    zone TEXT NOT NULL DEFAULT 'Main',
    capacity INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status table_status DEFAULT 'available',
    shape TEXT DEFAULT 'square',  -- square, round, rectangle
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    floor INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== RESERVATIONS ====================

-- 8. Reservations
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_number TEXT UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    end_time TIME,
    duration_minutes INT DEFAULT 90,
    guest_count INT NOT NULL DEFAULT 2 CHECK (guest_count > 0),
    status reservation_status DEFAULT 'pending',
    special_requests TEXT,
    occasion TEXT,  -- birthday, anniversary, business, etc.
    contact_name TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== ORDER SYSTEM ====================

-- 9. Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    order_type order_type DEFAULT 'dine_in',
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(4, 2) DEFAULT 8.00,  -- configurable tax %
    discount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    delivery_address TEXT,
    delivery_instructions TEXT,
    estimated_ready_minutes INT,
    actual_ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL, -- denormalized for history
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    special_instructions TEXT,
    is_completed BOOLEAN DEFAULT false, -- kitchen item-level tracking
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== PAYMENTS ====================

-- 11. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    method payment_method DEFAULT 'card',
    status payment_status DEFAULT 'pending',
    transaction_ref TEXT,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== CUSTOMER FEATURES ====================

-- 12. Customer Favorites
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (customer_id, menu_item_id)
);

-- 13. Reviews & Ratings
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reply TEXT,  -- staff reply to review
    replied_by UUID REFERENCES auth.users(id),
    replied_at TIMESTAMPTZ,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Loyalty Points Transactions
CREATE TABLE public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    points INT NOT NULL, -- positive = earned, negative = redeemed
    reason TEXT NOT NULL,
    reference_type TEXT, -- 'order', 'promotion', 'manual', 'signup', 'review'
    reference_id UUID,
    balance_after INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Customer Feedback (separate from item reviews)
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type feedback_type DEFAULT 'general',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    response TEXT,  -- admin response
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Customer Addresses (for delivery)
CREATE TABLE public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT DEFAULT 'Home',  -- Home, Work, Other
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INVENTORY ====================

-- 17. Inventory Items
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    sku TEXT UNIQUE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit inventory_unit DEFAULT 'pcs',
    min_quantity DECIMAL(10, 2) DEFAULT 10,
    max_quantity DECIMAL(10, 2) DEFAULT 1000,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0,
    supplier TEXT,
    supplier_contact TEXT,
    supplier_email TEXT,
    storage_location TEXT,  -- e.g. "Fridge A", "Dry storage shelf 3"
    last_restocked TIMESTAMPTZ,
    expiry_date DATE,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity <= min_quantity) STORED,
    is_perishable BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Inventory Restock Log
CREATE TABLE public.inventory_restock_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    quantity_added DECIMAL(10, 2) NOT NULL,
    cost_total DECIMAL(10, 2) DEFAULT 0,
    supplier TEXT,
    invoice_number TEXT,
    restocked_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Inventory Usage Log (tracks consumption per order)
CREATE TABLE public.inventory_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    reason TEXT DEFAULT 'order',  -- 'order', 'waste', 'adjustment'
    logged_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Put foreign key here after inventory is created
ALTER TABLE public.menu_item_ingredients ADD CONSTRAINT fk_menu_item_ingredients_inventory FOREIGN KEY (inventory_id) REFERENCES public.inventory(id) ON DELETE SET NULL;

-- ==================== STAFF MANAGEMENT ====================

-- 20. Staff Members
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    salary_monthly DECIMAL(12, 2),
    rating DECIMAL(3, 2) DEFAULT 0,
    status staff_status DEFAULT 'off_duty',
    emergency_contact TEXT,
    emergency_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    hired_at DATE DEFAULT CURRENT_DATE,
    terminated_at DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Staff Schedules
CREATE TABLE public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Staff Attendance / Clock In-Out
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    total_hours DECIMAL(5, 2),
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== PROMOTIONS ====================

-- 23. Promotions & Offers
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type promotion_type DEFAULT 'discount_percent',
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    code TEXT UNIQUE,
    max_uses INT,
    max_uses_per_customer INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    applicable_items UUID[],
    applicable_categories UUID[],
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    banner_image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 24. Promotion Redemptions
CREATE TABLE public.promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== NOTIFICATIONS ====================

-- 25. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type DEFAULT 'system',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== AUDIT / ACTIVITY LOG ====================

-- 26. Activity Log
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== SETTINGS ====================

-- 27. App Settings (key-value store for restaurant config)
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INDEXES ====================

-- Orders
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_table ON public.orders(table_id);
CREATE INDEX idx_orders_type ON public.orders(order_type);
CREATE INDEX idx_orders_completed ON public.orders(completed_at) WHERE completed_at IS NOT NULL;

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
CREATE INDEX idx_menu_item_ingredients_item ON public.menu_item_ingredients(menu_item_id);
CREATE INDEX idx_menu_item_ingredients_inv ON public.menu_item_ingredients(inventory_id);

-- Favorites
CREATE INDEX idx_favorites_customer ON public.favorites(customer_id);
CREATE INDEX idx_favorites_item ON public.favorites(menu_item_id);

-- Reviews
CREATE INDEX idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX idx_reviews_menu_item ON public.reviews(menu_item_id);
CREATE INDEX idx_reviews_order ON public.reviews(order_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Loyalty
CREATE INDEX idx_loyalty_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_created ON public.loyalty_transactions(created_at DESC);

-- Feedback
CREATE INDEX idx_feedback_customer ON public.feedback(customer_id);
CREATE INDEX idx_feedback_unresolved ON public.feedback(is_resolved) WHERE is_resolved = false;

-- Customer Addresses
CREATE INDEX idx_customer_addresses ON public.customer_addresses(customer_id);

-- Inventory
CREATE INDEX idx_inventory_low ON public.inventory(is_low_stock) WHERE is_low_stock = true;
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_inventory_usage_inv ON public.inventory_usage_log(inventory_id);
CREATE INDEX idx_inventory_usage_order ON public.inventory_usage_log(order_id);

-- Payments
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX idx_payments_method ON public.payments(method);

-- Staff
CREATE INDEX idx_staff_user ON public.staff(user_id);
CREATE INDEX idx_staff_active ON public.staff(is_active) WHERE is_active = true;
CREATE INDEX idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX idx_staff_attendance_staff ON public.staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_date ON public.staff_attendance(clock_in);

-- Promotions
CREATE INDEX idx_promotions_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_code ON public.promotions(code);
CREATE INDEX idx_promotion_redemptions_customer ON public.promotion_redemptions(customer_id);
CREATE INDEX idx_promotion_redemptions_promo ON public.promotion_redemptions(promotion_id);

-- Activity Log
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON public.activity_log(action);

-- Settings
CREATE INDEX idx_app_settings_key ON public.app_settings(key);

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
  _tax_rate DECIMAL(4,2);
  _delivery_fee DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO _subtotal
  FROM public.order_items WHERE order_id = _order_id;

  SELECT COALESCE(discount, 0), COALESCE(tax_rate, 8.00), COALESCE(delivery_fee, 0)
  INTO _discount, _tax_rate, _delivery_fee
  FROM public.orders WHERE id = _order_id;

  UPDATE public.orders
  SET subtotal = _subtotal,
      tax = ROUND((_subtotal - _discount) * (_tax_rate / 100), 2),
      total = ROUND((_subtotal - _discount) * (1 + _tax_rate / 100) + _delivery_fee, 2),
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
  _new_spent DECIMAL(12,2);
BEGIN
  SELECT customer_id, total INTO _customer_id, _total
  FROM public.orders WHERE id = _order_id;

  IF _customer_id IS NULL THEN RETURN; END IF;

  _points := FLOOR(_total);

  SELECT total_loyalty_points, lifetime_spent INTO _current_points, _new_spent
  FROM public.profiles WHERE id = _customer_id;

  _new_balance := COALESCE(_current_points, 0) + _points;
  _new_spent := COALESCE(_new_spent, 0) + _total;

  INSERT INTO public.loyalty_transactions (customer_id, points, reason, reference_type, reference_id, balance_after)
  VALUES (_customer_id, _points, 'Order #' || (SELECT order_number FROM public.orders WHERE id = _order_id), 'order', _order_id, _new_balance);

  UPDATE public.profiles
  SET total_loyalty_points = _new_balance,
      lifetime_spent = _new_spent,
      total_orders = total_orders + 1,
      total_visits = total_visits + 1,
      last_visit_at = now(),
      membership_tier = CASE
        WHEN _new_spent >= 5000 THEN 'platinum'
        WHEN _new_spent >= 2000 THEN 'gold'
        WHEN _new_spent >= 500 THEN 'silver'
        ELSE 'bronze'
      END,
      updated_at = now()
  WHERE id = _customer_id;

  -- Notify customer
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (_customer_id, 'loyalty', 'Points Earned! 🎉',
    'You earned ' || _points || ' points from your order. New balance: ' || _new_balance || ' points.',
    jsonb_build_object('order_id', _order_id, 'points', _points, 'new_balance', _new_balance));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update menu item average rating after a review
CREATE OR REPLACE FUNCTION public.update_menu_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.menu_item_id IS NOT NULL THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate reservation number
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reservation_number := 'R-' || LPAD(nextval('reservation_number_seq')::TEXT, 4, '0');
  NEW.end_time := (NEW.reservation_time + (NEW.duration_minutes || ' minutes')::INTERVAL)::TIME;
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
    'revenue_today', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at::date = CURRENT_DATE AND status NOT IN ('cancelled')),
    'revenue_this_week', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= date_trunc('week', CURRENT_DATE) AND status NOT IN ('cancelled')),
    'revenue_this_month', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= date_trunc('month', CURRENT_DATE) AND status NOT IN ('cancelled')),
    'available_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE status = 'available' AND is_active = true),
    'total_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE is_active = true),
    'occupied_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE status = 'occupied' AND is_active = true),
    'reserved_tables', (SELECT COUNT(*) FROM restaurant_tables WHERE status = 'reserved' AND is_active = true),
    'orders_preparing', (SELECT COUNT(*) FROM orders WHERE status = 'preparing'),
    'orders_ready', (SELECT COUNT(*) FROM orders WHERE status = 'ready'),
    'orders_pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'orders_served', (SELECT COUNT(*) FROM orders WHERE status = 'served' AND created_at::date = CURRENT_DATE),
    'avg_order_value', (SELECT ROUND(COALESCE(AVG(total), 0), 2) FROM orders WHERE created_at::date = CURRENT_DATE AND status NOT IN ('cancelled')),
    'total_customers', (SELECT COUNT(*) FROM profiles),
    'new_customers_today', (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    'low_stock_count', (SELECT COUNT(*) FROM inventory WHERE is_low_stock = true),
    'expiring_soon', (SELECT COUNT(*) FROM inventory WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '3 days'),
    'pending_reservations', (SELECT COUNT(*) FROM reservations WHERE status = 'pending'),
    'todays_reservations', (SELECT COUNT(*) FROM reservations WHERE reservation_date = CURRENT_DATE AND status IN ('pending', 'confirmed')),
    'active_staff', (SELECT COUNT(*) FROM staff WHERE status = 'on_duty'),
    'total_staff', (SELECT COUNT(*) FROM staff WHERE is_active = true),
    'pending_feedback', (SELECT COUNT(*) FROM feedback WHERE is_resolved = false),
    'active_promotions', (SELECT COUNT(*) FROM promotions WHERE is_active = true AND (expires_at IS NULL OR expires_at > now())),
    'total_tips_today', (SELECT COALESCE(SUM(tip_amount), 0) FROM payments WHERE created_at::date = CURRENT_DATE AND status = 'completed')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct inventory on order completion
CREATE OR REPLACE FUNCTION public.deduct_inventory_for_order(_order_id UUID)
RETURNS VOID AS $$
DECLARE
  _item RECORD;
  _ingredient RECORD;
BEGIN
  FOR _item IN SELECT * FROM order_items WHERE order_id = _order_id LOOP
    FOR _ingredient IN SELECT * FROM menu_item_ingredients WHERE menu_item_id = _item.menu_item_id LOOP
      UPDATE inventory
      SET quantity = GREATEST(0, quantity - (_ingredient.quantity_needed * _item.quantity))
      WHERE id = _ingredient.inventory_id;

      INSERT INTO inventory_usage_log (inventory_id, order_id, quantity_used, reason)
      VALUES (_ingredient.inventory_id, _order_id, _ingredient.quantity_needed * _item.quantity, 'order');
    END LOOP;
  END LOOP;
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
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_restock_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- PROFILES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- USER ROLES
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

-- MENU ITEM INGREDIENTS
CREATE POLICY "Anyone can view ingredients" ON public.menu_item_ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kitchen manage ingredients" ON public.menu_item_ingredients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage ingredients" ON public.menu_item_ingredients FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

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
CREATE POLICY "System insert loyalty" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (true);

-- FEEDBACK
CREATE POLICY "Customers create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "View own feedback" ON public.feedback FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- CUSTOMER ADDRESSES
CREATE POLICY "View own addresses" ON public.customer_addresses FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Manage own addresses" ON public.customer_addresses FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Update own addresses" ON public.customer_addresses FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Delete own addresses" ON public.customer_addresses FOR DELETE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins view addresses" ON public.customer_addresses FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- INVENTORY (admin/kitchen only)
CREATE POLICY "Kitchen view inventory" ON public.inventory FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- INVENTORY RESTOCK LOG
CREATE POLICY "Admins manage restock log" ON public.inventory_restock_log FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Kitchen view restock log" ON public.inventory_restock_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

-- INVENTORY USAGE LOG
CREATE POLICY "Admins manage usage log" ON public.inventory_usage_log FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Kitchen view usage log" ON public.inventory_usage_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));

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
CREATE POLICY "Delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ACTIVITY LOG
CREATE POLICY "Admins view activity log" ON public.activity_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- APP SETTINGS
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==================== SEED DATA ====================

-- Menu Categories
INSERT INTO public.menu_categories (name, icon_emoji, display_order) VALUES
  ('Breakfast', '🍳', 1), ('Lunch', '🥗', 2), ('Dinner', '🥩', 3),
  ('Drinks', '☕', 4), ('Desserts', '🍰', 5), ('Sides', '🍟', 6), ('Specials', '⭐', 7);

-- Restaurant Tables (all zones from frontend)
INSERT INTO public.restaurant_tables (table_number, zone, capacity, shape) VALUES
  ('T-01', 'Window', 2, 'round'), ('T-02', 'Main', 4, 'square'), ('T-03', 'Main', 4, 'square'),
  ('T-04', 'Main', 4, 'square'), ('T-05', 'VIP', 6, 'rectangle'), ('T-06', 'VIP', 6, 'rectangle'),
  ('T-07', 'Main', 4, 'square'), ('T-08', 'Patio', 2, 'round'), ('T-09', 'Patio', 4, 'square'),
  ('T-10', 'Private', 8, 'rectangle'), ('T-11', 'Window', 2, 'round'), ('T-12', 'Window', 4, 'square'),
  ('W1', 'Window', 2, 'round'), ('W2', 'Window', 2, 'round'), ('W3', 'Window', 4, 'square'), ('W4', 'Window', 4, 'square'),
  ('P1', 'Patio', 4, 'square'), ('P2', 'Patio', 4, 'square'), ('P3', 'Patio', 6, 'rectangle'),
  ('V1', 'VIP', 6, 'rectangle'), ('V2', 'VIP', 8, 'rectangle'),
  ('M1', 'Main', 2, 'round'), ('M2', 'Main', 4, 'square'), ('M3', 'Main', 4, 'square'), ('M4', 'Main', 6, 'rectangle'), ('M5', 'Main', 8, 'rectangle');

-- All Menu Items (matching frontend CustomerMenu.tsx exactly)
INSERT INTO public.menu_items (name, description, price, emoji, category, is_vegetarian, is_vegan, is_spicy, prep_time_minutes, calories, is_featured, avg_rating) VALUES
  ('Wagyu Steak', 'Premium grade wagyu with truffle butter', 85.00, '🥩', 'dinner', false, false, false, 35, 650, true, 4.9),
  ('Grilled Salmon', 'Atlantic salmon with herb crust', 45.00, '🐟', 'lunch', false, false, false, 25, 420, true, 4.8),
  ('Margherita Pizza', 'Fresh mozzarella, basil, tomato', 20.00, '🍕', 'lunch', true, false, false, 18, 580, false, 4.7),
  ('Truffle Pasta', 'Black truffle cream sauce', 45.00, '🍝', 'dinner', true, false, false, 20, 520, true, 4.8),
  ('Avocado Toast', 'Sourdough, poached egg, microgreens', 14.00, '🥑', 'breakfast', true, false, false, 10, 320, false, 4.5),
  ('Pancakes', 'Buttermilk stack with maple syrup', 16.00, '🥞', 'breakfast', true, false, false, 12, 450, false, 4.6),
  ('Iced Latte', 'Double shot espresso over ice', 6.00, '☕', 'beverage', true, true, false, 3, 120, false, 4.4),
  ('Tiramisu', 'Classic Italian coffee dessert', 12.00, '🍰', 'dessert', true, false, false, 5, 380, true, 4.9),
  ('Caesar Salad', 'Crisp romaine, parmesan, croutons', 18.00, '🥗', 'lunch', true, false, false, 8, 280, false, 4.5),
  ('Eggs Benedict', 'Poached eggs, hollandaise, English muffin', 17.00, '🍳', 'breakfast', true, false, false, 15, 420, false, 4.7),
  ('Lobster Bisque', 'Rich creamy lobster soup with sherry', 28.00, '🦞', 'dinner', false, false, false, 30, 350, true, 4.8),
  ('Fish & Chips', 'Beer-battered cod with tartar sauce', 22.00, '🐠', 'lunch', false, false, false, 20, 620, false, 4.4),
  ('Matcha Latte', 'Ceremonial grade matcha with oat milk', 7.00, '🍵', 'beverage', true, true, false, 3, 150, false, 4.6),
  ('Chocolate Lava Cake', 'Warm molten center with vanilla ice cream', 14.00, '🍫', 'dessert', true, false, false, 15, 480, true, 4.9),
  ('BBQ Ribs', 'Slow-smoked pork ribs, house BBQ glaze', 38.00, '🍖', 'dinner', false, false, false, 40, 720, false, 4.7),
  ('French Toast', 'Brioche with berry compote and cream', 15.00, '🍞', 'breakfast', true, false, false, 12, 400, false, 4.5),
  ('Mango Smoothie', 'Fresh mango, yogurt, honey blend', 8.00, '🥭', 'beverage', true, false, false, 3, 180, false, 4.3),
  ('Crème Brûlée', 'Vanilla custard with caramelized sugar', 13.00, '🍮', 'dessert', true, false, false, 8, 320, false, 4.8),
  ('Chicken Wings', 'Crispy buffalo wings with ranch dip', 16.00, '🍗', 'side', false, false, true, 18, 480, false, 4.6),
  ('Garlic Bread', 'Toasted with herb butter and parmesan', 8.00, '🧄', 'side', true, false, false, 8, 220, false, 4.3),
  ('Mushroom Risotto', 'Arborio rice, wild mushrooms, parmesan', 32.00, '🍄', 'dinner', true, false, false, 25, 450, false, 4.7),
  ('Tropical Mojito', 'Rum, mint, lime, passion fruit', 10.00, '🍹', 'beverage', true, true, false, 5, 160, false, 4.5),
  ('Sushi Platter', 'Chef''s selection of 12 premium pieces', 55.00, '🍣', 'special', false, false, false, 25, 380, true, 4.9),
  ('Lamb Chops', 'Herb-crusted with rosemary jus', 48.00, '🐑', 'special', false, false, false, 30, 580, true, 4.8),
  ('Sweet Potato Fries', 'Crispy with chipotle aioli dip', 9.00, '🍠', 'side', true, true, false, 10, 280, false, 4.4),
  ('Espresso Martini', 'Vodka, espresso, coffee liqueur', 14.00, '🍸', 'beverage', true, true, false, 5, 200, false, 4.7);

-- Menu Item Tags (matching frontend)
INSERT INTO public.menu_item_tags (menu_item_id, tag)
SELECT mi.id, t.tag FROM public.menu_items mi, (VALUES
  ('Wagyu Steak', 'Chef''s Special'), ('Truffle Pasta', 'Chef''s Special'),
  ('Lobster Bisque', 'Chef''s Special'), ('Sushi Platter', 'Chef''s Special'),
  ('Lamb Chops', 'Chef''s Special'),
  ('Grilled Salmon', 'Healthy'), ('Avocado Toast', 'Healthy'), ('Caesar Salad', 'Healthy'),
  ('Matcha Latte', 'Healthy'), ('Mango Smoothie', 'Healthy'),
  ('Avocado Toast', 'Vegetarian'), ('Margherita Pizza', 'Vegetarian'),
  ('Sweet Potato Fries', 'Vegetarian'), ('Mushroom Risotto', 'Vegetarian'),
  ('Tiramisu', 'Popular'), ('Eggs Benedict', 'Popular'), ('Chocolate Lava Cake', 'Popular'),
  ('Chicken Wings', 'Popular'), ('Espresso Martini', 'Popular')
) AS t(item_name, tag) WHERE mi.name = t.item_name;

-- Inventory seed data
INSERT INTO public.inventory (name, category, sku, quantity, unit, min_quantity, cost_per_unit, supplier, is_perishable) VALUES
  ('Wagyu Beef', 'Meat', 'MEAT-001', 25, 'kg', 5, 85.00, 'Premium Meats Co.', true),
  ('Atlantic Salmon', 'Seafood', 'SEA-001', 30, 'kg', 8, 22.00, 'Ocean Fresh', true),
  ('Pizza Dough', 'Bakery', 'BAK-001', 50, 'pcs', 15, 1.50, 'Local Bakery', true),
  ('Mozzarella Cheese', 'Dairy', 'DAI-001', 20, 'kg', 5, 12.00, 'Dairy Farm', true),
  ('Truffle Oil', 'Condiments', 'CON-001', 10, 'l', 2, 45.00, 'Italian Imports', false),
  ('Coffee Beans', 'Beverages', 'BEV-001', 40, 'kg', 10, 18.00, 'Bean Masters', false),
  ('Matcha Powder', 'Beverages', 'BEV-002', 5, 'kg', 1, 35.00, 'Japanese Imports', false),
  ('Oat Milk', 'Dairy', 'DAI-002', 60, 'l', 15, 3.50, 'Oatly Supply', true),
  ('Fresh Eggs', 'Dairy', 'DAI-003', 200, 'pcs', 50, 0.35, 'Free Range Farm', true),
  ('Butter', 'Dairy', 'DAI-004', 30, 'kg', 8, 8.00, 'Dairy Farm', true),
  ('Flour', 'Bakery', 'BAK-002', 100, 'kg', 20, 1.20, 'Mill Supply', false),
  ('Sugar', 'Bakery', 'BAK-003', 80, 'kg', 15, 0.90, 'Sugar Co.', false),
  ('Olive Oil', 'Condiments', 'CON-002', 25, 'l', 5, 8.50, 'Italian Imports', false),
  ('Chicken Wings', 'Meat', 'MEAT-002', 40, 'kg', 10, 6.50, 'Poultry Plus', true),
  ('Pork Ribs', 'Meat', 'MEAT-003', 20, 'kg', 5, 12.00, 'Premium Meats Co.', true),
  ('Lobster', 'Seafood', 'SEA-002', 15, 'kg', 4, 38.00, 'Ocean Fresh', true),
  ('Lamb Rack', 'Meat', 'MEAT-004', 12, 'kg', 3, 32.00, 'Premium Meats Co.', true),
  ('Avocados', 'Produce', 'PRO-001', 80, 'pcs', 20, 1.50, 'Fresh Produce Co.', true),
  ('Romaine Lettuce', 'Produce', 'PRO-002', 40, 'pcs', 10, 2.00, 'Fresh Produce Co.', true),
  ('Tomatoes', 'Produce', 'PRO-003', 50, 'kg', 10, 3.00, 'Fresh Produce Co.', true),
  ('Lemons/Limes', 'Produce', 'PRO-004', 60, 'pcs', 15, 0.50, 'Fresh Produce Co.', true),
  ('Fresh Basil', 'Herbs', 'HRB-001', 30, 'pcs', 8, 1.20, 'Herb Garden', true),
  ('Vanilla Extract', 'Condiments', 'CON-003', 5, 'l', 1, 25.00, 'Spice World', false),
  ('Vodka', 'Spirits', 'SPR-001', 15, 'l', 3, 18.00, 'Spirits Distributor', false),
  ('Rum', 'Spirits', 'SPR-002', 10, 'l', 2, 16.00, 'Spirits Distributor', false),
  ('Fresh Cream', 'Dairy', 'DAI-005', 20, 'l', 5, 5.50, 'Dairy Farm', true),
  ('Arborio Rice', 'Grains', 'GRN-001', 25, 'kg', 5, 4.00, 'Italian Imports', false),
  ('Wild Mushrooms', 'Produce', 'PRO-005', 10, 'kg', 3, 18.00, 'Forager Supply', true),
  ('Parmesan', 'Dairy', 'DAI-006', 15, 'kg', 4, 22.00, 'Italian Imports', true),
  ('Maple Syrup', 'Condiments', 'CON-004', 8, 'l', 2, 12.00, 'Canadian Imports', false);

-- App Settings (restaurant configuration)
INSERT INTO public.app_settings (key, value, description) VALUES
  ('restaurant_name', '"Café X"', 'Restaurant display name'),
  ('tax_rate', '8.00', 'Default tax percentage'),
  ('currency', '"USD"', 'Currency code'),
  ('currency_symbol', '"$"', 'Currency symbol'),
  ('opening_hours', '{"mon": "07:00-23:00", "tue": "07:00-23:00", "wed": "07:00-23:00", "thu": "07:00-23:00", "fri": "07:00-00:00", "sat": "08:00-00:00", "sun": "08:00-22:00"}', 'Operating hours'),
  ('reservation_slot_minutes', '30', 'Reservation time slot interval'),
  ('max_reservation_guests', '12', 'Maximum party size for online reservations'),
  ('delivery_fee', '5.00', 'Standard delivery fee'),
  ('delivery_radius_km', '10', 'Maximum delivery radius'),
  ('loyalty_points_per_dollar', '1', 'Points earned per $1 spent'),
  ('loyalty_welcome_bonus', '200', 'Points given to new signups'),
  ('review_bonus_points', '10', 'Points given for writing a review'),
  ('min_order_for_delivery', '20.00', 'Minimum order amount for delivery'),
  ('kitchen_prep_buffer_minutes', '5', 'Extra time buffer added to prep estimates'),
  ('auto_cancel_unpaid_minutes', '30', 'Auto-cancel unpaid orders after N minutes');

-- Default promotions
INSERT INTO public.promotions (title, description, type, value, min_order_amount, code, max_uses, starts_at, expires_at) VALUES
  ('Welcome 10% Off', 'New customer discount on first order', 'discount_percent', 10, 20, 'WELCOME10', NULL, now(), now() + INTERVAL '1 year'),
  ('Free Dessert Friday', 'Get a free dessert with orders over $50 on Fridays', 'free_item', 0, 50, 'FRIYAY', NULL, now(), now() + INTERVAL '6 months'),
  ('$5 Off Orders Over $40', 'Limited time flat discount', 'discount_fixed', 5, 40, 'SAVE5', 500, now(), now() + INTERVAL '3 months');

-- ==================== GAMIFICATION TABLES ====================

-- 28. Spin Wheel Segments
CREATE TABLE public.spin_wheel_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    coins INT NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#7c3aed',
    probability_weight INT NOT NULL DEFAULT 10,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 29. Spin Wheel Log
CREATE TABLE public.spin_wheel_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    segment_id UUID REFERENCES public.spin_wheel_segments(id) ON DELETE SET NULL,
    coins_won INT NOT NULL DEFAULT 0,
    segment_label TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 30. Coin Rewards (redeemable items)
CREATE TABLE public.coin_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎁',
    cost_coins INT NOT NULL CHECK (cost_coins > 0),
    reward_type TEXT NOT NULL DEFAULT 'discount_percent', -- discount_percent, discount_fixed, free_item, perk
    reward_value DECIMAL(10,2) DEFAULT 0, -- e.g. 10 for 10%, 5 for $5 off
    applicable_category TEXT, -- optional: limit to category
    is_active BOOLEAN DEFAULT true,
    max_redemptions INT, -- null = unlimited
    current_redemptions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 31. Coin Redemptions (customer reward claims)
CREATE TABLE public.coin_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES public.coin_rewards(id) ON DELETE SET NULL,
    coins_spent INT NOT NULL,
    reward_name TEXT NOT NULL,
    reward_type TEXT,
    reward_value DECIMAL(10,2),
    is_used BOOLEAN DEFAULT false, -- has the reward been applied to an order?
    used_on_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 32. Coin Milestones
CREATE TABLE public.coin_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    icon TEXT DEFAULT '🏆',
    coins_required INT NOT NULL,
    bonus_coins INT DEFAULT 0, -- bonus coins awarded on reaching milestone
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Gamification Indexes
CREATE INDEX idx_spin_log_customer ON public.spin_wheel_log(customer_id);
CREATE INDEX idx_spin_log_date ON public.spin_wheel_log(created_at);
CREATE INDEX idx_coin_redemptions_customer ON public.coin_redemptions(customer_id);
CREATE INDEX idx_coin_redemptions_unused ON public.coin_redemptions(is_used) WHERE is_used = false;

-- Gamification RLS
ALTER TABLE public.spin_wheel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view wheel segments" ON public.spin_wheel_segments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage segments" ON public.spin_wheel_segments FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "View own spins" ON public.spin_wheel_log FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Create own spins" ON public.spin_wheel_log FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins view all spins" ON public.spin_wheel_log FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Anyone view rewards" ON public.coin_rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage rewards" ON public.coin_rewards FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "View own redemptions" ON public.coin_redemptions FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Create own redemptions" ON public.coin_redemptions FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins view redemptions" ON public.coin_redemptions FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Anyone view milestones" ON public.coin_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage milestones" ON public.coin_milestones FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Gamification Seed Data

-- Spin wheel segments
INSERT INTO public.spin_wheel_segments (label, coins, color, probability_weight, display_order) VALUES
  ('5 Coins', 5, '#7c3aed', 30, 1),
  ('10 Coins', 10, '#22c55e', 25, 2),
  ('25 Coins', 25, '#f59e0b', 15, 3),
  ('50 Coins', 50, '#3b82f6', 12, 4),
  ('2 Coins', 2, '#8b5cf6', 8, 5),
  ('100 Coins', 100, '#ef4444', 5, 6),
  ('1 Coin', 1, '#6b7280', 3, 7),
  ('200 Coins!', 200, '#eab308', 2, 8);

-- Coin rewards
INSERT INTO public.coin_rewards (name, icon, cost_coins, reward_type, reward_value, description) VALUES
  ('10% Off Next Order', '🏷️', 200, 'discount_percent', 10, 'Get 10% off your next order'),
  ('Free Dessert', '🍰', 350, 'free_item', 0, 'Any dessert on the house'),
  ('Free Drink', '☕', 150, 'free_item', 0, 'Any beverage for free'),
  ('25% Off Next Order', '🔥', 500, 'discount_percent', 25, 'Quarter off your next meal'),
  ('Free Appetizer', '🥗', 250, 'free_item', 0, 'Any starter on us'),
  ('Free Main Course', '🥩', 800, 'free_item', 0, 'Any main dish for free'),
  ('50% Off Next Order', '💎', 1200, 'discount_percent', 50, 'Half price on your next visit'),
  ('VIP Table Access', '👑', 1500, 'perk', 0, 'Priority VIP seating for one visit');

-- Coin milestones
INSERT INTO public.coin_milestones (title, icon, coins_required, bonus_coins, description, display_order) VALUES
  ('Bronze Spender', '🥉', 500, 50, 'Earn your first 500 coins', 1),
  ('Silver Status', '🥈', 1000, 100, 'Reach 1,000 lifetime coins', 2),
  ('Gold Member', '🥇', 2000, 200, 'Join the Gold tier at 2,000 coins', 3),
  ('Platinum VIP', '💎', 5000, 500, 'Ultimate status at 5,000 coins', 4);

-- ==================== FEATURE: ORDER TRACKING ====================

-- 33. Order Tracking Steps (real-time status timeline)
CREATE TABLE public.order_tracking_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    is_current BOOLEAN DEFAULT false,
    step_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_tracking_order ON public.order_tracking_steps(order_id);
CREATE INDEX idx_order_tracking_current ON public.order_tracking_steps(order_id) WHERE is_current = true;

ALTER TABLE public.order_tracking_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own tracking" ON public.order_tracking_steps FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Kitchen manage tracking" ON public.order_tracking_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'kitchen_staff'));
CREATE POLICY "Admins manage tracking" ON public.order_tracking_steps FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Auto-create tracking steps when order is placed
CREATE OR REPLACE FUNCTION public.create_order_tracking_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_tracking_steps (order_id, status, title, description, step_order, is_current, completed_at) VALUES
    (NEW.id, 'pending', 'Order Placed', 'Your order has been received', 1, true, now()),
    (NEW.id, 'confirmed', 'Confirmed', 'Restaurant confirmed your order', 2, false, NULL),
    (NEW.id, 'preparing', 'Preparing', 'Chef is cooking your food', 3, false, NULL),
    (NEW.id, 'ready', 'Ready', 'Your order is ready for pickup/serving', 4, false, NULL),
    (NEW.id, 'served', 'Served', 'Enjoy your meal!', 5, false, NULL),
    (NEW.id, 'completed', 'Completed', 'Thank you for dining with us', 6, false, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_created_tracking
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.create_order_tracking_steps();

-- Update tracking steps when order status changes
CREATE OR REPLACE FUNCTION public.update_order_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE public.order_tracking_steps
    SET is_current = false
    WHERE order_id = NEW.id;

    UPDATE public.order_tracking_steps
    SET is_current = true, completed_at = now()
    WHERE order_id = NEW.id AND status = NEW.status;

    -- Also mark all previous steps as completed
    UPDATE public.order_tracking_steps
    SET completed_at = COALESCE(completed_at, now())
    WHERE order_id = NEW.id AND step_order <= (
      SELECT step_order FROM public.order_tracking_steps WHERE order_id = NEW.id AND status = NEW.status LIMIT 1
    );

    -- Notify customer
    IF NEW.customer_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (NEW.customer_id, 'order',
        CASE NEW.status
          WHEN 'confirmed' THEN 'Order Confirmed ✅'
          WHEN 'preparing' THEN 'Being Prepared 👨‍🍳'
          WHEN 'ready' THEN 'Ready for Pickup! 🔔'
          WHEN 'served' THEN 'Enjoy Your Meal! 🍽️'
          WHEN 'completed' THEN 'Order Complete 🎉'
          WHEN 'cancelled' THEN 'Order Cancelled ❌'
          ELSE 'Order Updated'
        END,
        'Order #' || NEW.order_number || ' status: ' || NEW.status,
        jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_changed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_order_tracking();

-- ==================== FEATURE: REFERRAL SYSTEM ====================

-- 34. Referral Codes
CREATE TABLE public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    bonus_coins_referrer INT DEFAULT 100,
    bonus_coins_referee INT DEFAULT 50,
    max_uses INT DEFAULT 50,
    current_uses INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 35. Referral Log
CREATE TABLE public.referral_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code_id UUID REFERENCES public.referral_codes(id) ON DELETE SET NULL,
    coins_awarded_referrer INT NOT NULL DEFAULT 0,
    coins_awarded_referee INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (referee_id) -- each user can only be referred once
);

CREATE INDEX idx_referral_codes_referrer ON public.referral_codes(referrer_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_log_referrer ON public.referral_log(referrer_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own referral codes" ON public.referral_codes FOR SELECT TO authenticated USING (referrer_id = auth.uid());
CREATE POLICY "Create own referral codes" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "Admins manage referral codes" ON public.referral_codes FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "View own referral log" ON public.referral_log FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referee_id = auth.uid());
CREATE POLICY "System insert referral log" ON public.referral_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins view referral log" ON public.referral_log FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Auto-generate referral code on signup
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  _code TEXT;
BEGIN
  _code := 'CAFE' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6));
  INSERT INTO public.referral_codes (referrer_id, code) VALUES (NEW.id, _code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_create_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- ==================== FEATURE: DAILY DEALS & HAPPY HOUR ====================

-- 36. Daily Deals
CREATE TABLE public.daily_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    deal_type TEXT NOT NULL DEFAULT 'discount_percent', -- discount_percent, discount_fixed, free_item, bogo
    deal_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    category_filter dish_category, -- optional: applies to specific category
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- NULL = every day
    start_time TIME DEFAULT '00:00',
    end_time TIME DEFAULT '23:59',
    is_happy_hour BOOLEAN DEFAULT false,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2), -- cap for percentage discounts
    banner_emoji TEXT DEFAULT '🔥',
    is_active BOOLEAN DEFAULT true,
    starts_at DATE DEFAULT CURRENT_DATE,
    expires_at DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 37. Deal Redemptions
CREATE TABLE public.deal_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.daily_deals(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_daily_deals_active ON public.daily_deals(is_active) WHERE is_active = true;
CREATE INDEX idx_daily_deals_day ON public.daily_deals(day_of_week);
CREATE INDEX idx_daily_deals_happy ON public.daily_deals(is_happy_hour) WHERE is_happy_hour = true;
CREATE INDEX idx_deal_redemptions_customer ON public.deal_redemptions(customer_id);
CREATE INDEX idx_deal_redemptions_deal ON public.deal_redemptions(deal_id);

ALTER TABLE public.daily_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active deals" ON public.daily_deals FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage deals" ON public.daily_deals FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "View own deal redemptions" ON public.deal_redemptions FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Create deal redemptions" ON public.deal_redemptions FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admins view deal redemptions" ON public.deal_redemptions FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_daily_deals_updated_at BEFORE UPDATE ON public.daily_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed deals
INSERT INTO public.daily_deals (title, description, deal_type, deal_value, day_of_week, start_time, end_time, is_happy_hour, banner_emoji) VALUES
  ('Taco Tuesday', '20% off all main courses every Tuesday', 'discount_percent', 20, 2, '11:00', '22:00', false, '🌮'),
  ('Happy Hour', 'Buy 1 Get 1 Free on all drinks', 'bogo', 0, NULL, '16:00', '19:00', true, '🍺'),
  ('Weekend Brunch Special', '$5 off breakfast items on weekends', 'discount_fixed', 5, 0, '08:00', '13:00', false, '🥞'),
  ('Weekend Brunch Special Sun', '$5 off breakfast items on weekends', 'discount_fixed', 5, 6, '08:00', '13:00', false, '🥞'),
  ('Late Night Dessert', '30% off all desserts after 9PM', 'discount_percent', 30, NULL, '21:00', '23:59', false, '🍰'),
  ('Wine Wednesday', 'Free appetizer with any wine order', 'free_item', 0, 3, '17:00', '22:00', true, '🍷');

-- ==================== FEATURE: CUSTOMER REVIEWS (enhanced) ====================
-- Reviews table already exists. Add photo support column.

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photos TEXT[]; -- array of photo URLs
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS order_item_name TEXT; -- denormalized for display

-- 38. Review Helpful Votes
CREATE TABLE public.review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (review_id, user_id)
);

CREATE INDEX idx_review_votes_review ON public.review_helpful_votes(review_id);
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view votes" ON public.review_helpful_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers vote" ON public.review_helpful_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Remove own vote" ON public.review_helpful_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Award coins for reviews
CREATE OR REPLACE FUNCTION public.award_review_coins()
RETURNS TRIGGER AS $$
DECLARE
  _current_points INT;
BEGIN
  SELECT total_loyalty_points INTO _current_points FROM public.profiles WHERE id = NEW.customer_id;
  _current_points := COALESCE(_current_points, 0) + 10;

  INSERT INTO public.loyalty_transactions (customer_id, points, reason, reference_type, reference_id, balance_after)
  VALUES (NEW.customer_id, 10, 'Review bonus', 'review', NEW.id, _current_points);

  UPDATE public.profiles SET total_loyalty_points = _current_points WHERE id = NEW.customer_id;

  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (NEW.customer_id, 'loyalty', 'Review Bonus! ✍️', 'You earned 10 coins for your review. Keep sharing your thoughts!');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_award_coins
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.award_review_coins();

-- ==================== FEATURE: STAFF SCHEDULE CALENDAR ====================

-- 39. Staff Schedule Calendar (date-specific, not just recurring)
CREATE TABLE public.staff_schedule_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
    schedule_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    role_override TEXT, -- if different from usual role
    notes TEXT,
    is_day_off BOOLEAN DEFAULT false,
    swap_requested BOOLEAN DEFAULT false,
    swap_with_staff_id UUID REFERENCES public.staff(id),
    swap_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (staff_id, schedule_date)
);

CREATE INDEX idx_staff_calendar_date ON public.staff_schedule_calendar(schedule_date);
CREATE INDEX idx_staff_calendar_staff ON public.staff_schedule_calendar(staff_id);
CREATE INDEX idx_staff_calendar_swaps ON public.staff_schedule_calendar(swap_requested) WHERE swap_requested = true;

ALTER TABLE public.staff_schedule_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage schedule calendar" ON public.staff_schedule_calendar FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Staff view own schedule calendar" ON public.staff_schedule_calendar FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = staff_id AND user_id = auth.uid())
);
CREATE POLICY "Staff request swaps" ON public.staff_schedule_calendar FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = staff_id AND user_id = auth.uid())
);

CREATE TRIGGER update_staff_calendar_updated_at BEFORE UPDATE ON public.staff_schedule_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ==================== FEATURE: AI DISH RECOMMENDATIONS ====================

-- 40. Customer Preferences (learned from behavior)
CREATE TABLE public.customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    favorite_categories dish_category[] DEFAULT '{}',
    favorite_tags TEXT[] DEFAULT '{}',
    dietary_restrictions TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten_free, halal
    avg_spend_range DECIMAL(10,2) DEFAULT 0,
    spice_preference TEXT DEFAULT 'mild', -- mild, medium, spicy
    order_frequency TEXT DEFAULT 'occasional', -- first_time, occasional, regular, frequent
    last_computed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 41. AI Recommendation Log
CREATE TABLE public.recommendation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    score DECIMAL(5,3) NOT NULL DEFAULT 0, -- 0-1 relevance score
    reason TEXT, -- 'popular_in_category', 'similar_to_favorites', 'trending', 'new_item', 'reorder'
    was_clicked BOOLEAN DEFAULT false,
    was_ordered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customer_prefs_customer ON public.customer_preferences(customer_id);
CREATE INDEX idx_recommendation_log_customer ON public.recommendation_log(customer_id);
CREATE INDEX idx_recommendation_log_item ON public.recommendation_log(menu_item_id);

ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own preferences" ON public.customer_preferences FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Update own preferences" ON public.customer_preferences FOR ALL TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins view preferences" ON public.customer_preferences FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "View own recommendations" ON public.recommendation_log FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "System insert recommendations" ON public.recommendation_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins view recommendations" ON public.recommendation_log FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_customer_prefs_updated_at BEFORE UPDATE ON public.customer_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to compute recommendations for a customer
CREATE OR REPLACE FUNCTION public.get_recommendations(_customer_id UUID, _limit INT DEFAULT 6)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_emoji TEXT,
  item_price DECIMAL,
  item_rating DECIMAL,
  item_category dish_category,
  rec_score DECIMAL,
  rec_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_orders AS (
    SELECT oi.menu_item_id, COUNT(*) as order_count
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.customer_id = _customer_id AND o.status != 'cancelled'
    GROUP BY oi.menu_item_id
  ),
  customer_cats AS (
    SELECT mi.category, COUNT(*) as cat_count
    FROM customer_orders co
    JOIN menu_items mi ON mi.id = co.menu_item_id
    GROUP BY mi.category
  ),
  popular_items AS (
    SELECT menu_item_id, COUNT(*) as pop_count
    FROM order_items
    GROUP BY menu_item_id
    ORDER BY pop_count DESC
    LIMIT 20
  )
  SELECT
    mi.id,
    mi.name,
    mi.emoji,
    mi.price,
    mi.avg_rating,
    mi.category,
    ROUND((
      COALESCE((SELECT cat_count FROM customer_cats WHERE category = mi.category), 0) * 0.3 +
      COALESCE(mi.avg_rating, 0) * 0.2 +
      CASE WHEN mi.is_featured THEN 0.15 ELSE 0 END +
      COALESCE((SELECT pop_count FROM popular_items WHERE menu_item_id = mi.id), 0) * 0.05 +
      CASE WHEN co.menu_item_id IS NOT NULL THEN 0.3 ELSE 0 END
    )::DECIMAL, 3),
    CASE
      WHEN co.menu_item_id IS NOT NULL THEN 'reorder'
      WHEN EXISTS (SELECT 1 FROM customer_cats WHERE category = mi.category) THEN 'similar_to_favorites'
      WHEN mi.is_featured THEN 'trending'
      WHEN EXISTS (SELECT 1 FROM popular_items WHERE menu_item_id = mi.id) THEN 'popular'
      ELSE 'new_for_you'
    END
  FROM menu_items mi
  LEFT JOIN customer_orders co ON co.menu_item_id = mi.id
  WHERE mi.is_available = true
  ORDER BY 7 DESC
  LIMIT _limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create customer preferences on first order
CREATE OR REPLACE FUNCTION public.update_customer_preferences()
RETURNS TRIGGER AS $$
DECLARE
  _cats dish_category[];
BEGIN
  IF NEW.customer_id IS NULL THEN RETURN NEW; END IF;

  SELECT ARRAY_AGG(DISTINCT mi.category)
  INTO _cats
  FROM order_items oi
  JOIN menu_items mi ON mi.id = oi.menu_item_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.customer_id = NEW.customer_id AND o.status != 'cancelled';

  INSERT INTO public.customer_preferences (customer_id, favorite_categories, order_frequency, avg_spend_range, last_computed_at)
  VALUES (
    NEW.customer_id,
    COALESCE(_cats, '{}'),
    CASE
      WHEN (SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id) >= 10 THEN 'frequent'
      WHEN (SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id) >= 5 THEN 'regular'
      WHEN (SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id) >= 2 THEN 'occasional'
      ELSE 'first_time'
    END,
    COALESCE((SELECT AVG(total) FROM orders WHERE customer_id = NEW.customer_id AND status != 'cancelled'), 0),
    now()
  )
  ON CONFLICT (customer_id) DO UPDATE SET
    favorite_categories = EXCLUDED.favorite_categories,
    order_frequency = EXCLUDED.order_frequency,
    avg_spend_range = EXCLUDED.avg_spend_range,
    last_computed_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_update_preferences
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.update_customer_preferences();

-- noop: harmless touch