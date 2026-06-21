-- Boutique audiences (women / men / kids) and outfit-type tagging

ALTER TABLE boutiques
  ADD COLUMN IF NOT EXISTS audiences TEXT[] NOT NULL DEFAULT '{women}';

ALTER TABLE boutique_outfit_types
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'women'
  CHECK (audience IN ('women', 'men', 'kids'));

ALTER TABLE boutique_portfolio_items
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'women'
  CHECK (audience IN ('women', 'men', 'kids'));

-- Backfill outfit audiences from labels (best-effort)
UPDATE boutique_outfit_types
SET audience = CASE
  WHEN lower(label) ~ '(kids|kid |child|children|boy|girl|party wear)' THEN 'kids'
  WHEN lower(label) ~ '(sherwani|bandhgala|jodhpuri|nehru jacket|kurta set|indo-western suit|pathani|dhoti)' THEN 'men'
  ELSE 'women'
END
WHERE audience = 'women';

-- Derive boutique audiences from outfit mix
UPDATE boutiques b
SET audiences = COALESCE(
  (
    SELECT ARRAY_AGG(DISTINCT o.audience ORDER BY o.audience)
    FROM boutique_outfit_types o
    WHERE o.boutique_id = b.id
  ),
  '{women}'
);

-- Men + kids outfit types for multi-audience seed boutiques
INSERT INTO boutique_outfit_types (boutique_id, label, audience)
SELECT v.boutique_id, v.label, v.audience
FROM (VALUES
  ('b1000001-0001-4000-8000-000000000002'::uuid, 'Sherwani', 'men'),
  ('b1000001-0001-4000-8000-000000000002'::uuid, 'Kurta Set', 'men'),
  ('b1000001-0001-4000-8000-000000000005'::uuid, 'Kids Lehenga', 'kids'),
  ('b1000001-0001-4000-8000-000000000005'::uuid, 'Party Wear', 'kids'),
  ('b1000001-0001-4000-8000-000000000010'::uuid, 'Sherwani', 'men'),
  ('b1000001-0001-4000-8000-000000000010'::uuid, 'Kurta Set', 'men'),
  ('b1000001-0001-4000-8000-000000000010'::uuid, 'Kids Lehenga', 'kids'),
  ('b1000001-0001-4000-8000-000000000010'::uuid, 'Kids Kurta', 'kids')
) AS v(boutique_id, label, audience)
WHERE NOT EXISTS (
  SELECT 1
  FROM boutique_outfit_types o
  WHERE o.boutique_id = v.boutique_id
    AND lower(o.label) = lower(v.label)
);

UPDATE boutiques SET audiences = '{women,men}' WHERE slug = 'royal-threads-hyd';
UPDATE boutiques SET audiences = '{women,kids}' WHERE slug = 'sharara-house-hyd';
UPDATE boutiques SET audiences = '{women,men,kids}' WHERE slug = 'heritage-weaves-hyd';
