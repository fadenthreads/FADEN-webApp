-- Rich portfolio items: dress photos tagged by outfit type with descriptions
-- Run after 014_geo_locations.sql

ALTER TABLE boutique_portfolio_items
  ADD COLUMN IF NOT EXISTS outfit_type_id UUID REFERENCES boutique_outfit_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS price_hint TEXT;

CREATE INDEX IF NOT EXISTS idx_portfolio_outfit_type
  ON boutique_portfolio_items (boutique_id, outfit_type_id);
