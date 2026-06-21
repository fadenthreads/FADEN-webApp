-- Customer-facing note when a boutique is not accepting orders

ALTER TABLE boutiques
  ADD COLUMN IF NOT EXISTS availability_notice TEXT;
