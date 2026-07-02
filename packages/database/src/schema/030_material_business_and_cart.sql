-- Allow material items in cart and wishlist

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_item_type_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_item_type_check
  CHECK (item_type IN ('boutique', 'design', 'material'));

ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_item_type_check;
ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_item_type_check
  CHECK (item_type IN ('boutique', 'design', 'material'));

-- Material supplier / fabric business registration applications
CREATE TABLE IF NOT EXISTS material_business_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  material_categories TEXT,
  inventory_summary TEXT,
  online_store_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_business_applications_applicant
  ON material_business_applications(applicant_id);

ALTER TABLE material_business_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY material_business_applications_select_own ON material_business_applications
  FOR SELECT USING (applicant_id = auth.uid() OR is_admin());

CREATE POLICY material_business_applications_insert_own ON material_business_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());
