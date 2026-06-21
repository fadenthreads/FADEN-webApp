-- Phase 6: reviews — one review per delivered order, insert validation
-- Run in Supabase SQL editor after 008_boutique_modification_requests.sql
-- Safe to re-run

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_order_unique ON reviews(order_id)
  WHERE order_id IS NOT NULL;

DROP POLICY IF EXISTS reviews_insert_own ON reviews;

CREATE POLICY reviews_insert_own ON reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND order_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'delivered'
        AND o.boutique_id = boutique_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM reviews r WHERE r.order_id = order_id
    )
  );
