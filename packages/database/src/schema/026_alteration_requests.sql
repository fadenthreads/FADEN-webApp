-- Alteration booking requests (nearest boutique within urgency window)
-- Run after 025_quotation_advance_percent.sql

DO $$
BEGIN
  CREATE TYPE alteration_request_status AS ENUM (
    'requested',
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS alteration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE SET NULL,
  alteration_type TEXT NOT NULL,
  urgency_hours INTEGER NOT NULL CHECK (urgency_hours > 0 AND urgency_hours <= 48),
  home_service_ok BOOLEAN NOT NULL DEFAULT false,
  home_address TEXT,
  home_lat DOUBLE PRECISION,
  home_lng DOUBLE PRECISION,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION,
  status alteration_request_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alteration_requests_customer
  ON alteration_requests (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alteration_requests_boutique
  ON alteration_requests (boutique_id, created_at DESC)
  WHERE boutique_id IS NOT NULL;

ALTER TABLE alteration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS alteration_requests_customer ON alteration_requests;
CREATE POLICY alteration_requests_customer ON alteration_requests FOR ALL
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = alteration_requests.boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR is_admin()
  );
