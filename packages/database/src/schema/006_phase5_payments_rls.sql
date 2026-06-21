-- Phase 5: payments RLS — customers pay confirmed orders; participants can read
-- Run in Supabase SQL editor after 005_phase4_operations_rls.sql
-- Safe to re-run (drops policies first)

DROP POLICY IF EXISTS payments_select ON payments;
DROP POLICY IF EXISTS payments_insert ON payments;
DROP POLICY IF EXISTS payments_update ON payments;

CREATE POLICY payments_select ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM boutiques b
            WHERE b.id = o.boutique_id AND b.owner_id = auth.uid()
          )
          OR is_admin()
        )
    )
  );

CREATE POLICY payments_insert ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'confirmed'
    )
    OR is_admin()
  );

CREATE POLICY payments_update ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (o.customer_id = auth.uid() OR is_admin())
    )
  );
