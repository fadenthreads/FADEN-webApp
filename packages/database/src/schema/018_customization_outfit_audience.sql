-- Store who the customization outfit is for (women / men / kids)

ALTER TABLE customization_requests
  ADD COLUMN IF NOT EXISTS outfit_audience TEXT
  CHECK (outfit_audience IS NULL OR outfit_audience IN ('women', 'men', 'kids'));

-- Backfill from form payload when present
UPDATE customization_requests
SET outfit_audience = form_payload->>'outfitAudience'
WHERE outfit_audience IS NULL
  AND form_payload->>'outfitAudience' IN ('women', 'men', 'kids');
