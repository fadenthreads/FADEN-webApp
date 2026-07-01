-- Allow conversation participants to mark messages as read (notifications).
CREATE POLICY messages_update ON messages FOR UPDATE
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
  )
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
