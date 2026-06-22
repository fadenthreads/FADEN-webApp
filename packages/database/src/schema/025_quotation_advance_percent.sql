-- Advance payment percent on quotations (max 40% when boutique supplies fabric)
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS advance_percent SMALLINT NOT NULL DEFAULT 40
  CHECK (advance_percent >= 0 AND advance_percent <= 40);
