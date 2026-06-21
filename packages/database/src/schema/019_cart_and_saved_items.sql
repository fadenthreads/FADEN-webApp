-- Cart + richer saved-item metadata for wishlist

ALTER TABLE wishlist_items
  ADD COLUMN IF NOT EXISTS boutique_slug TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS price_hint TEXT,
  ADD COLUMN IF NOT EXISTS outfit_label TEXT,
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'boutique'
    CHECK (item_type IN ('boutique', 'design'));

UPDATE wishlist_items SET design_ref = '' WHERE design_ref IS NULL;
ALTER TABLE wishlist_items ALTER COLUMN design_ref SET DEFAULT '';
ALTER TABLE wishlist_items ALTER COLUMN design_ref SET NOT NULL;

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id) ON DELETE SET NULL,
  boutique_slug TEXT NOT NULL,
  design_ref TEXT NOT NULL DEFAULT '',
  item_type TEXT NOT NULL CHECK (item_type IN ('boutique', 'design')),
  title TEXT NOT NULL,
  image_url TEXT,
  price_hint TEXT,
  outfit_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, boutique_slug, design_ref)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items(customer_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cart_items_own ON cart_items;
CREATE POLICY cart_items_own ON cart_items FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_customer_slug_design
  ON wishlist_items (customer_id, boutique_slug, design_ref);
