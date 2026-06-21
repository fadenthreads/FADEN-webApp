-- Customer saved measurement profiles + home measurement visits
-- Run after 022_boutique_staff.sql

CREATE TABLE IF NOT EXISTS customer_measurement_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  outfit_type TEXT,
  outfit_audience TEXT CHECK (outfit_audience IS NULL OR outfit_audience IN ('women', 'men', 'kids')),
  measurement_unit TEXT NOT NULL DEFAULT 'in' CHECK (measurement_unit IN ('in', 'cm')),
  measurements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_measurement_profiles_customer
  ON customer_measurement_profiles (customer_id, updated_at DESC);

ALTER TABLE customer_measurement_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_measurement_profiles_owner ON customer_measurement_profiles;
DROP POLICY IF EXISTS customer_measurement_profiles_customer ON customer_measurement_profiles;
DROP POLICY IF EXISTS customer_measurement_profiles_owner_insert ON customer_measurement_profiles;

CREATE POLICY customer_measurement_profiles_customer ON customer_measurement_profiles FOR ALL
  USING (customer_id = auth.uid() OR is_admin())
  WITH CHECK (customer_id = auth.uid() OR is_admin());

-- Extend staff roster for home visit assignment
ALTER TABLE boutique_staff
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IS NULL OR gender IN ('female', 'male')),
  ADD COLUMN IF NOT EXISTS can_do_home_visits BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  CREATE TYPE home_visit_status AS ENUM (
    'requested',
    'confirmed',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS home_measurement_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  customization_request_id UUID REFERENCES customization_requests(id) ON DELETE SET NULL,
  requested_start TIMESTAMPTZ NOT NULL,
  requested_end TIMESTAMPTZ NOT NULL,
  confirmed_start TIMESTAMPTZ,
  confirmed_end TIMESTAMPTZ,
  visit_address TEXT,
  assistant_gender_preference TEXT NOT NULL DEFAULT 'any'
    CHECK (assistant_gender_preference IN ('female', 'male', 'any')),
  assigned_staff_id UUID REFERENCES boutique_staff(id) ON DELETE SET NULL,
  status home_visit_status NOT NULL DEFAULT 'requested',
  owner_notes TEXT,
  captured_measurements JSONB,
  measurement_unit TEXT DEFAULT 'in' CHECK (measurement_unit IS NULL OR measurement_unit IN ('in', 'cm')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_home_visits_customer ON home_measurement_visits (customer_id, requested_start DESC);
CREATE INDEX IF NOT EXISTS idx_home_visits_boutique ON home_measurement_visits (boutique_id, requested_start DESC);
CREATE INDEX IF NOT EXISTS idx_home_visits_request ON home_measurement_visits (customization_request_id)
  WHERE customization_request_id IS NOT NULL;

ALTER TABLE home_measurement_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS home_visits_select ON home_measurement_visits;
CREATE POLICY home_visits_select ON home_measurement_visits FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())
    )
  );

DROP POLICY IF EXISTS home_visits_insert ON home_measurement_visits;
CREATE POLICY home_visits_insert ON home_measurement_visits FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS home_visits_update ON home_measurement_visits;
CREATE POLICY home_visits_update ON home_measurement_visits FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())
    )
  );

-- Must run after home_measurement_visits exists (policy references that table)
CREATE POLICY customer_measurement_profiles_owner_insert ON customer_measurement_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM home_measurement_visits v
      INNER JOIN boutiques b ON b.id = v.boutique_id
      WHERE v.customer_id = customer_measurement_profiles.customer_id
        AND v.status = 'completed'
        AND b.owner_id = auth.uid()
    )
  );
