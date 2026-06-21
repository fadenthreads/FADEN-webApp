-- FADEN Phase 2 schema — run in Supabase SQL editor or via CLI migrate
-- 19 tables + enums, RLS, profile bootstrap trigger

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'boutique_owner', 'admin');
CREATE TYPE boutique_status AS ENUM ('draft', 'pending_verification', 'verified', 'rejected', 'suspended');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'needs_info');
CREATE TYPE customization_status AS ENUM ('draft', 'submitted', 'quoted', 'accepted', 'in_production', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('draft', 'quoted', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE message_sender_type AS ENUM ('customer', 'boutique', 'admin', 'system');
CREATE TYPE availability_status AS ENUM ('open', 'closed');
CREATE TYPE booking_mode AS ENUM ('appointment', 'video', 'both');

-- 1. profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  location_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. boutiques
CREATE TABLE boutiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  maps_url TEXT,
  years_in_business INT,
  status boutique_status NOT NULL DEFAULT 'pending_verification',
  pricing_info TEXT,
  avg_delivery_time TEXT,
  rush_orders_accepted BOOLEAN NOT NULL DEFAULT false,
  max_orders_per_month INT,
  reviews_summary TEXT,
  social_links TEXT,
  completed_orders_approx INT,
  availability availability_status NOT NULL DEFAULT 'open',
  working_hours TEXT,
  booking_mode booking_mode NOT NULL DEFAULT 'both',
  communication_prefs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutiques_owner ON boutiques(owner_id);
CREATE INDEX idx_boutiques_status ON boutiques(status);
CREATE INDEX idx_boutiques_slug ON boutiques(slug);

-- 3. boutique_outfit_types
CREATE TABLE boutique_outfit_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_outfit_types_boutique ON boutique_outfit_types(boutique_id);

-- 4. boutique_portfolio_items
CREATE TABLE boutique_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_portfolio_boutique ON boutique_portfolio_items(boutique_id);

-- 5. boutique_services
CREATE TABLE boutique_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_services_boutique ON boutique_services(boutique_id);

-- 6. boutique_availability
CREATE TABLE boutique_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_availability_boutique ON boutique_availability(boutique_id);

-- 7. boutique_verifications
CREATE TABLE boutique_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  status verification_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES profiles(id),
  notes TEXT,
  trust_media_urls TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boutique_verifications_status ON boutique_verifications(status);

-- 8. customization_requests
CREATE TABLE customization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE SET NULL,
  status customization_status NOT NULL DEFAULT 'draft',
  outfit_type TEXT,
  outfit_description TEXT,
  occasion TEXT,
  fabric_source TEXT,
  measurement_mode TEXT,
  delivery_date DATE,
  form_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customization_requests_customer ON customization_requests(customer_id);
CREATE INDEX idx_customization_requests_boutique ON customization_requests(boutique_id);

-- 9. customization_inspirations
CREATE TABLE customization_inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES customization_requests(id) ON DELETE CASCADE,
  url TEXT,
  notes TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE RESTRICT,
  customization_request_id UUID REFERENCES customization_requests(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_boutique ON orders(boutique_id);

-- 11. order_events
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_events_order ON order_events(order_id);

-- 12. quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. quotation_line_items
CREATE TABLE quotation_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_participants ON conversations(customer_id, boutique_id);

-- 15. messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type message_sender_type NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- 16. wishlist_items
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  design_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, boutique_id, design_ref)
);

-- 17. reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_boutique ON reviews(boutique_id);

-- 18. payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_payment_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);

-- 19. admin_audit_log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER boutiques_updated_at BEFORE UPDATE ON boutiques
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER customization_requests_updated_at BEFORE UPDATE ON customization_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Bootstrap profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_outfit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE boutique_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- boutiques: public read verified; owners manage own
CREATE POLICY boutiques_select_verified ON boutiques FOR SELECT
  USING (status = 'verified' OR owner_id = auth.uid() OR is_admin());
CREATE POLICY boutiques_insert_owner ON boutiques FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY boutiques_update_owner ON boutiques FOR UPDATE
  USING (owner_id = auth.uid() OR is_admin());

-- child boutique tables follow boutique ownership
CREATE POLICY boutique_outfit_types_all ON boutique_outfit_types FOR ALL
  USING (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())));
CREATE POLICY boutique_portfolio_all ON boutique_portfolio_items FOR ALL
  USING (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())));
CREATE POLICY boutique_services_all ON boutique_services FOR ALL
  USING (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())));
CREATE POLICY boutique_availability_all ON boutique_availability FOR ALL
  USING (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())));

CREATE POLICY boutique_verifications_select ON boutique_verifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())));
CREATE POLICY boutique_verifications_insert ON boutique_verifications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND b.owner_id = auth.uid()));
CREATE POLICY boutique_verifications_update_admin ON boutique_verifications FOR UPDATE
  USING (is_admin());

-- customization + orders: participant access
CREATE POLICY customization_requests_customer ON customization_requests FOR ALL
  USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY customization_inspirations_via_request ON customization_inspirations FOR ALL
  USING (EXISTS (SELECT 1 FROM customization_requests r WHERE r.id = request_id AND (r.customer_id = auth.uid() OR is_admin())));

CREATE POLICY orders_participant ON orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM boutiques b WHERE b.id = boutique_id AND b.owner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY wishlist_own ON wishlist_items FOR ALL USING (customer_id = auth.uid());
CREATE POLICY reviews_public_read ON reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert_own ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY admin_audit_admin ON admin_audit_log FOR ALL USING (is_admin());
