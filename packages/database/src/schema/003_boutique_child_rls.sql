-- Fix boutique child-table RLS so owners can insert rows after creating a boutique
-- Run in Supabase SQL editor if registration fails with row-level security errors

DROP POLICY IF EXISTS boutique_outfit_types_all ON boutique_outfit_types;
CREATE POLICY boutique_outfit_types_all ON boutique_outfit_types FOR ALL
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

DROP POLICY IF EXISTS boutique_portfolio_all ON boutique_portfolio_items;
CREATE POLICY boutique_portfolio_all ON boutique_portfolio_items FOR ALL
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

DROP POLICY IF EXISTS boutique_services_all ON boutique_services;
CREATE POLICY boutique_services_all ON boutique_services FOR ALL
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

DROP POLICY IF EXISTS boutique_availability_all ON boutique_availability;
CREATE POLICY boutique_availability_all ON boutique_availability FOR ALL
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
