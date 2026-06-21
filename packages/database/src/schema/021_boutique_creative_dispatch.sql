-- Creative Dispatch: passion projects / skill showcases on boutique profiles
-- Run after 020_availability_notice.sql

CREATE TABLE IF NOT EXISTS boutique_creative_dispatch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tag TEXT,
  description TEXT,
  media_url TEXT,
  gradient TEXT NOT NULL DEFAULT 'from-burgundy/60 via-rose-900/40 to-background-soft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boutique_creative_dispatch_boutique
  ON boutique_creative_dispatch (boutique_id, sort_order);

ALTER TABLE boutique_creative_dispatch ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS boutique_creative_dispatch_owner ON boutique_creative_dispatch;
CREATE POLICY boutique_creative_dispatch_owner ON boutique_creative_dispatch FOR ALL
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

DROP POLICY IF EXISTS boutique_creative_dispatch_public_read ON boutique_creative_dispatch;
CREATE POLICY boutique_creative_dispatch_public_read ON boutique_creative_dispatch FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.status = 'verified'
    )
  );
