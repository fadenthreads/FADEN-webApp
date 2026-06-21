-- Boutique staff records for owner dashboard (payroll / team roster)
-- Run after 021_boutique_creative_dispatch.sql

CREATE TABLE IF NOT EXISTS boutique_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  pay_amount TEXT NOT NULL,
  pay_period TEXT NOT NULL DEFAULT 'monthly',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boutique_staff_boutique
  ON boutique_staff (boutique_id, sort_order);

ALTER TABLE boutique_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS boutique_staff_owner ON boutique_staff;
CREATE POLICY boutique_staff_owner ON boutique_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND (b.owner_id = auth.uid() OR is_admin())
    )
  );
