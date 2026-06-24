-- Allow boutique owners to update alteration requests assigned to their studio
-- Run after 026_alteration_requests.sql

DROP POLICY IF EXISTS alteration_requests_customer ON alteration_requests;

CREATE POLICY alteration_requests_select ON alteration_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = alteration_requests.boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY alteration_requests_insert ON alteration_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR is_admin());

CREATE POLICY alteration_requests_update_customer ON alteration_requests FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY alteration_requests_update_owner ON alteration_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = alteration_requests.boutique_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = alteration_requests.boutique_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY alteration_requests_admin ON alteration_requests FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
