-- Boutique profile modification requests (owner submits, admin approves)
-- Run in Supabase SQL editor after 007_boutique_customer_profiles_rls.sql

CREATE TABLE IF NOT EXISTS boutique_modification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status verification_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  owner_notes TEXT,
  reviewer_id UUID REFERENCES profiles(id),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boutique_modification_status
  ON boutique_modification_requests(status);

CREATE INDEX IF NOT EXISTS idx_boutique_modification_boutique
  ON boutique_modification_requests(boutique_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_boutique_modification_one_pending
  ON boutique_modification_requests(boutique_id)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS boutique_modification_requests_updated_at ON boutique_modification_requests;
CREATE TRIGGER boutique_modification_requests_updated_at
  BEFORE UPDATE ON boutique_modification_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE boutique_modification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS boutique_modification_select ON boutique_modification_requests;
CREATE POLICY boutique_modification_select ON boutique_modification_requests FOR SELECT
  USING (owner_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS boutique_modification_insert ON boutique_modification_requests;
CREATE POLICY boutique_modification_insert ON boutique_modification_requests FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id
        AND b.owner_id = auth.uid()
        AND b.status = 'verified'
    )
  );

DROP POLICY IF EXISTS boutique_modification_update_admin ON boutique_modification_requests;
CREATE POLICY boutique_modification_update_admin ON boutique_modification_requests FOR UPDATE
  USING (is_admin());
