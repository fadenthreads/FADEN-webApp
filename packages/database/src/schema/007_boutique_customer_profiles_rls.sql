-- Allow boutique owners to read profiles of customers they work with
-- Run in Supabase SQL editor after 005_phase4_operations_rls.sql

DROP POLICY IF EXISTS profiles_select_boutique_customer ON profiles;

CREATE POLICY profiles_select_boutique_customer ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN boutiques b ON b.id = o.boutique_id
      WHERE o.customer_id = profiles.id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM customization_requests r
      JOIN boutiques b ON b.id = r.boutique_id
      WHERE r.customer_id = profiles.id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM conversations c
      JOIN boutiques b ON b.id = c.boutique_id
      WHERE c.customer_id = profiles.id AND b.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM quotations q
      JOIN boutiques b ON b.id = q.boutique_id
      WHERE q.customer_id = profiles.id AND b.owner_id = auth.uid()
    )
  );
