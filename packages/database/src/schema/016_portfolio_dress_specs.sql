-- Dress size and length specs for portfolio re-ordering
-- Run after 015_portfolio_dresses.sql

ALTER TABLE boutique_portfolio_items
  ADD COLUMN IF NOT EXISTS size_label TEXT,
  ADD COLUMN IF NOT EXISTS length_details JSONB NOT NULL DEFAULT '{}'::jsonb;
