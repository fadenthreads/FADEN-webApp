-- Phase 4: operational RLS for customization, orders, messaging, quotations
-- Run in Supabase SQL editor after 001_phase2.sql (and 004 if applied)

-- customization_requests — boutique owners need read/update on assigned requests
DROP POLICY IF EXISTS customization_requests_customer ON customization_requests;

CREATE POLICY customization_requests_select ON customization_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY customization_requests_insert ON customization_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY customization_requests_update ON customization_requests FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- customization_inspirations
DROP POLICY IF EXISTS customization_inspirations_via_request ON customization_inspirations;

CREATE POLICY customization_inspirations_select ON customization_inspirations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customization_requests r
      WHERE r.id = request_id
        AND (
          r.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM boutiques b
            WHERE b.id = r.boutique_id AND b.owner_id = auth.uid()
          )
          OR is_admin()
        )
    )
  );

CREATE POLICY customization_inspirations_insert ON customization_inspirations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customization_requests r
      WHERE r.id = request_id AND r.customer_id = auth.uid()
    )
  );

-- orders — insert/update for participants
CREATE POLICY orders_insert_customer ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY orders_update_participant ON orders FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- order_events
CREATE POLICY order_events_select ON order_events FOR SELECT
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

CREATE POLICY order_events_insert ON order_events FOR INSERT
  WITH CHECK (
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

-- quotations
CREATE POLICY quotations_select ON quotations FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY quotations_insert ON quotations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY quotation_line_items_select ON quotation_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations q
      WHERE q.id = quotation_id
        AND (
          q.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM boutiques b
            WHERE b.id = q.boutique_id AND b.owner_id = auth.uid()
          )
          OR is_admin()
        )
    )
  );

CREATE POLICY quotation_line_items_insert ON quotation_line_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations q
      JOIN boutiques b ON b.id = q.boutique_id
      WHERE q.id = quotation_id AND (b.owner_id = auth.uid() OR is_admin())
    )
  );

-- conversations
CREATE POLICY conversations_select ON conversations FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY conversations_insert ON conversations FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY conversations_update ON conversations FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM boutiques b
      WHERE b.id = boutique_id AND b.owner_id = auth.uid()
    )
    OR is_admin()
  );

-- messages
CREATE POLICY messages_select ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (
          c.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM boutiques b
            WHERE b.id = c.boutique_id AND b.owner_id = auth.uid()
          )
          OR is_admin()
        )
    )
  );

CREATE POLICY messages_insert ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (
          c.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM boutiques b
            WHERE b.id = c.boutique_id AND b.owner_id = auth.uid()
          )
          OR is_admin()
        )
    )
  );
