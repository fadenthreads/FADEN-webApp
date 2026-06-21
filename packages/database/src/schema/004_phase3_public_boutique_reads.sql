-- Phase 3: allow customers to read verified boutique portfolio data (public discovery)
-- Run in Supabase SQL editor after 001_phase2.sql

DROP POLICY IF EXISTS boutique_outfit_types_public_read ON boutique_outfit_types;
CREATE POLICY boutique_outfit_types_public_read ON boutique_outfit_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.status = 'verified'
    )
  );

DROP POLICY IF EXISTS boutique_portfolio_public_read ON boutique_portfolio_items;
CREATE POLICY boutique_portfolio_public_read ON boutique_portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.status = 'verified'
    )
  );

DROP POLICY IF EXISTS boutique_services_public_read ON boutique_services;
CREATE POLICY boutique_services_public_read ON boutique_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.status = 'verified'
    )
  );
