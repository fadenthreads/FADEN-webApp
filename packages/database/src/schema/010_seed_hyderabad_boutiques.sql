-- Seed 10 verified Hyderabad boutiques with different outfit-type combinations.
-- Run in Supabase Dashboard → SQL Editor (postgres role).
--
-- Creates 10 auth users + profiles (via trigger) + boutiques + outfit types + services + verifications.
-- Login password for all seed owners: SeedPass123!
--
-- If login fails after seeding, run 011_fix_seed_auth.sql (or: pnpm fix:seed-auth from apps/web).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. Owner auth users (profiles created by handle_new_user trigger) ─────────
-- Uses full GoTrue-compatible columns + auth.identities for email/password login.

WITH seed_owners AS (
  SELECT *
  FROM (VALUES
    ('a1000001-0001-4000-8000-000000000001'::uuid, 'lakshmi.stitches@seed.faden.test', 'Lakshmi Reddy'),
    ('a1000001-0001-4000-8000-000000000002'::uuid, 'royal.threads@seed.faden.test', 'Priya Sharma'),
    ('a1000001-0001-4000-8000-000000000003'::uuid, 'saree.sabha@seed.faden.test', 'Meena Iyer'),
    ('a1000001-0001-4000-8000-000000000004'::uuid, 'gown.gallery@seed.faden.test', 'Ananya Kapoor'),
    ('a1000001-0001-4000-8000-000000000005'::uuid, 'sharara.house@seed.faden.test', 'Fatima Khan'),
    ('a1000001-0001-4000-8000-000000000006'::uuid, 'silk.route@seed.faden.test', 'Sunita Agarwal'),
    ('a1000001-0001-4000-8000-000000000007'::uuid, 'bridal.bloom@seed.faden.test', 'Kavya Nair'),
    ('a1000001-0001-4000-8000-000000000008'::uuid, 'anarkali.atelier@seed.faden.test', 'Zara Ahmed'),
    ('a1000001-0001-4000-8000-000000000009'::uuid, 'fusion.faden@seed.faden.test', 'Rhea Malhotra'),
    ('a1000001-0001-4000-8000-000000000010'::uuid, 'heritage.weaves@seed.faden.test', 'Deepa Choudhary')
  ) AS t(id, email, full_name)
),
instance AS (
  SELECT COALESCE(
    (SELECT i.id FROM auth.instances i LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ) AS instance_id
)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  instance.instance_id,
  s.id,
  'authenticated',
  'authenticated',
  s.email,
  crypt('SeedPass123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', s.full_name, 'role', 'boutique_owner'),
  now(),
  now(),
  '',
  '',
  '',
  ''
FROM seed_owners s
CROSS JOIN instance
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  confirmation_token = '',
  email_change = '',
  email_change_token_new = '',
  recovery_token = '',
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- Identities (required for email/password sign-in)
DELETE FROM auth.identities i
USING auth.users u
WHERE i.user_id = u.id
  AND u.email LIKE '%@seed.faden.test'
  AND i.provider = 'email';

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(), now(), now()
FROM auth.users u
WHERE u.email LIKE '%@seed.faden.test';

UPDATE profiles p
SET
  location_label = 'Hyderabad',
  phone = '+91-98765' || lpad(sub.rn::text, 5, '0')
FROM (
  SELECT id, row_number() OVER (ORDER BY email) AS rn
  FROM profiles
  WHERE email LIKE '%@seed.faden.test'
) sub
WHERE p.id = sub.id;

-- ── 2. Boutiques ─────────────────────────────────────────────────────────────

INSERT INTO boutiques (
  id, owner_id, slug, name, owner_name, phone, email, address, maps_url,
  years_in_business, status, pricing_info, avg_delivery_time, rush_orders_accepted,
  max_orders_per_month, reviews_summary, completed_orders_approx, availability,
  working_hours, booking_mode, communication_prefs
) VALUES
  (
    'b1000001-0001-4000-8000-000000000001',
    'a1000001-0001-4000-8000-000000000001',
    'lakshmi-stitches-hyd',
    'Lakshmi Stitches',
    'Lakshmi Reddy',
    '+91-9876500001',
    'lakshmi.stitches@seed.faden.test',
    '12 Road No. 10, Banjara Hills, Hyderabad, Telangana 500034',
    'https://maps.google.com/?q=Banjara+Hills+Hyderabad',
    8, 'verified', 'Kurtis from ₹2,500 · Anarkalis from ₹4,500', '10–14 days', true,
    25, 'Known for crisp finishing and everyday ethnic wear.', 120, 'open',
    'Mon–Sat 10:00–20:00', 'both', 'WhatsApp preferred'
  ),
  (
    'b1000001-0001-4000-8000-000000000002',
    'a1000001-0001-4000-8000-000000000002',
    'royal-threads-hyd',
    'Royal Threads Hyderabad',
    'Priya Sharma',
    '+91-9876500002',
    'royal.threads@seed.faden.test',
    '45 Jubilee Hills Check Post, Hyderabad, Telangana 500033',
    'https://maps.google.com/?q=Jubilee+Hills+Hyderabad',
    12, 'verified', 'Bridal lehengas from ₹45,000', '21–30 days', false,
    12, 'Specialist in bridal and reception lehengas.', 85, 'open',
    'Tue–Sun 11:00–19:00', 'appointment', 'Call or in-app chat'
  ),
  (
    'b1000001-0001-4000-8000-000000000003',
    'a1000001-0001-4000-8000-000000000003',
    'saree-sabha-hyd',
    'Saree Sabha Studio',
    'Meena Iyer',
    '+91-9876500003',
    'saree.sabha@seed.faden.test',
    'WaveRock SEZ, Gachibowli, Hyderabad, Telangana 500032',
    'https://maps.google.com/?q=Gachibowli+Hyderabad',
    6, 'verified', 'Saree blouses from ₹1,800 · Custom drapes from ₹3,200', '7–10 days', true,
    30, 'Expert blouse fitting and saree draping consultations.', 200, 'open',
    'Mon–Sat 09:30–18:30', 'both', 'Email for appointments'
  ),
  (
    'b1000001-0001-4000-8000-000000000004',
    'a1000001-0001-4000-8000-000000000004',
    'gown-gallery-hyd',
    'Gown Gallery Hyd',
    'Ananya Kapoor',
    '+91-9876500004',
    'gown.gallery@seed.faden.test',
    'Mindspace IT Park, Hitech City, Hyderabad, Telangana 500081',
    'https://maps.google.com/?q=Hitech+City+Hyderabad',
    5, 'verified', 'Evening gowns from ₹8,000 · Indo-western from ₹6,500', '12–18 days', true,
    18, 'Modern silhouettes with Indian embellishment.', 64, 'open',
    'Wed–Mon 10:00–19:00', 'video', 'Video consults available'
  ),
  (
    'b1000001-0001-4000-8000-000000000005',
    'a1000001-0001-4000-8000-000000000005',
    'sharara-house-hyd',
    'Sharara House',
    'Fatima Khan',
    '+91-9876500005',
    'sharara.house@seed.faden.test',
    '91 HUDA Techno Enclave, Madhapur, Hyderabad, Telangana 500081',
    'https://maps.google.com/?q=Madhapur+Hyderabad',
    9, 'verified', 'Sharara sets from ₹5,500 · Lehengas from ₹12,000', '14–20 days', true,
    20, 'Festive shararas and lightweight lehengas.', 95, 'open',
    'Mon–Sat 11:00–20:00', 'both', 'WhatsApp for fabric swatches'
  ),
  (
    'b1000001-0001-4000-8000-000000000006',
    'a1000001-0001-4000-8000-000000000006',
    'silk-route-hyd',
    'Silk Route Tailors',
    'Sunita Agarwal',
    '+91-9876500006',
    'silk.route@seed.faden.test',
    'Kondapur Main Road, Hyderabad, Telangana 500084',
    'https://maps.google.com/?q=Kondapur+Hyderabad',
    15, 'verified', 'Kurtis from ₹2,000 · Sarees stitched from ₹4,000', '8–12 days', false,
    35, 'Family-run studio for daily and festive wear.', 310, 'open',
    'Mon–Sat 10:00–21:00', 'both', 'Walk-ins welcome'
  ),
  (
    'b1000001-0001-4000-8000-000000000007',
    'a1000001-0001-4000-8000-000000000007',
    'bridal-bloom-hyd',
    'Bridal Bloom Boutique',
    'Kavya Nair',
    '+91-9876500007',
    'bridal.bloom@seed.faden.test',
    'SP Road, Secunderabad, Hyderabad, Telangana 500003',
    'https://maps.google.com/?q=Secunderabad+Hyderabad',
    11, 'verified', 'Bridal packages from ₹55,000', '25–35 days', false,
    10, 'Full bridal trousseau and trial sessions.', 72, 'open',
    'By appointment only', 'appointment', 'Book via phone'
  ),
  (
    'b1000001-0001-4000-8000-000000000008',
    'a1000001-0001-4000-8000-000000000008',
    'anarkali-atelier-hyd',
    'Anarkali Atelier',
    'Zara Ahmed',
    '+91-9876500008',
    'anarkali.atelier@seed.faden.test',
    'Greenlands, Begumpet, Hyderabad, Telangana 500016',
    'https://maps.google.com/?q=Begumpet+Hyderabad',
    7, 'verified', 'Anarkalis from ₹4,000 · Kurtis from ₹2,800', '10–15 days', true,
    22, 'Flowing anarkalis with hand embroidery options.', 88, 'open',
    'Mon–Sat 10:30–19:30', 'both', 'In-app messaging'
  ),
  (
    'b1000001-0001-4000-8000-000000000009',
    'a1000001-0001-4000-8000-000000000009',
    'fusion-faden-hyd',
    'Fusion Faden Studio',
    'Rhea Malhotra',
    '+91-9876500009',
    'fusion.faden@seed.faden.test',
    'Ameerpet X Roads, Hyderabad, Telangana 500016',
    'https://maps.google.com/?q=Ameerpet+Hyderabad',
    4, 'verified', 'Indo-western from ₹5,500 · Gowns from ₹9,000', '12–16 days', true,
    16, 'Contemporary cuts for cocktail and sangeet.', 41, 'open',
    'Tue–Sun 11:00–20:00', 'video', 'Virtual fittings offered'
  ),
  (
    'b1000001-0001-4000-8000-000000000010',
    'a1000001-0001-4000-8000-000000000010',
    'heritage-weaves-hyd',
    'Heritage Weaves Hyd',
    'Deepa Choudhary',
    '+91-9876500010',
    'heritage.weaves@seed.faden.test',
    'Lakdikapul, Hyderabad, Telangana 500004',
    'https://maps.google.com/?q=Lakdikapul+Hyderabad',
    18, 'verified', 'Full custom from ₹3,500 · Bridal from ₹40,000', '14–28 days', true,
    28, 'Wide range — kurti, lehenga, saree, and bridal.', 420, 'open',
    'Mon–Sat 09:00–20:00', 'both', 'WhatsApp and phone'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── 3. Outfit types (different combinations per boutique) ───────────────────

INSERT INTO boutique_outfit_types (boutique_id, label) VALUES
  ('b1000001-0001-4000-8000-000000000001', 'Kurti'),
  ('b1000001-0001-4000-8000-000000000001', 'Anarkali'),
  ('b1000001-0001-4000-8000-000000000002', 'Lehenga'),
  ('b1000001-0001-4000-8000-000000000002', 'Bridal'),
  ('b1000001-0001-4000-8000-000000000003', 'Saree'),
  ('b1000001-0001-4000-8000-000000000003', 'Blouse'),
  ('b1000001-0001-4000-8000-000000000004', 'Gown'),
  ('b1000001-0001-4000-8000-000000000004', 'Indo-Western'),
  ('b1000001-0001-4000-8000-000000000005', 'Sharara'),
  ('b1000001-0001-4000-8000-000000000005', 'Lehenga'),
  ('b1000001-0001-4000-8000-000000000006', 'Kurti'),
  ('b1000001-0001-4000-8000-000000000006', 'Saree'),
  ('b1000001-0001-4000-8000-000000000006', 'Blouse'),
  ('b1000001-0001-4000-8000-000000000007', 'Bridal'),
  ('b1000001-0001-4000-8000-000000000007', 'Lehenga'),
  ('b1000001-0001-4000-8000-000000000007', 'Gown'),
  ('b1000001-0001-4000-8000-000000000008', 'Anarkali'),
  ('b1000001-0001-4000-8000-000000000008', 'Kurti'),
  ('b1000001-0001-4000-8000-000000000008', 'Sharara'),
  ('b1000001-0001-4000-8000-000000000009', 'Indo-Western'),
  ('b1000001-0001-4000-8000-000000000009', 'Gown'),
  ('b1000001-0001-4000-8000-000000000010', 'Kurti'),
  ('b1000001-0001-4000-8000-000000000010', 'Lehenga'),
  ('b1000001-0001-4000-8000-000000000010', 'Saree'),
  ('b1000001-0001-4000-8000-000000000010', 'Bridal');

-- ── 4. Services ──────────────────────────────────────────────────────────────

INSERT INTO boutique_services (boutique_id, label) VALUES
  ('b1000001-0001-4000-8000-000000000001', 'Custom stitching'),
  ('b1000001-0001-4000-8000-000000000001', 'Alterations'),
  ('b1000001-0001-4000-8000-000000000002', 'Bridal trials'),
  ('b1000001-0001-4000-8000-000000000002', 'Embroidery'),
  ('b1000001-0001-4000-8000-000000000003', 'Blouse fitting'),
  ('b1000001-0001-4000-8000-000000000003', 'Saree draping'),
  ('b1000001-0001-4000-8000-000000000004', 'Video consultation'),
  ('b1000001-0001-4000-8000-000000000004', 'Custom design'),
  ('b1000001-0001-4000-8000-000000000005', 'Festive wear'),
  ('b1000001-0001-4000-8000-000000000005', 'Rush orders'),
  ('b1000001-0001-4000-8000-000000000006', 'Home measurement'),
  ('b1000001-0001-4000-8000-000000000006', 'Fabric sourcing'),
  ('b1000001-0001-4000-8000-000000000007', 'Bridal trousseau'),
  ('b1000001-0001-4000-8000-000000000007', 'Jewellery coordination'),
  ('b1000001-0001-4000-8000-000000000008', 'Hand embroidery'),
  ('b1000001-0001-4000-8000-000000000008', 'Custom stitching'),
  ('b1000001-0001-4000-8000-000000000009', 'Indo-western design'),
  ('b1000001-0001-4000-8000-000000000009', 'Virtual fitting'),
  ('b1000001-0001-4000-8000-000000000010', 'All occasion wear'),
  ('b1000001-0001-4000-8000-000000000010', 'Bulk orders');

-- ── 5. Verification records (approved) ───────────────────────────────────────

INSERT INTO boutique_verifications (boutique_id, status, notes, reviewed_at)
SELECT id, 'approved', 'Seed data — auto-approved for testing', now()
FROM boutiques
WHERE slug IN (
  'lakshmi-stitches-hyd', 'royal-threads-hyd', 'saree-sabha-hyd', 'gown-gallery-hyd',
  'sharara-house-hyd', 'silk-route-hyd', 'bridal-bloom-hyd', 'anarkali-atelier-hyd',
  'fusion-faden-hyd', 'heritage-weaves-hyd'
)
AND NOT EXISTS (
  SELECT 1 FROM boutique_verifications v WHERE v.boutique_id = boutiques.id
);

COMMIT;

-- Quick check:
-- SELECT b.name, b.status, b.address, array_agg(o.label ORDER BY o.label) AS outfits
-- FROM boutiques b
-- JOIN boutique_outfit_types o ON o.boutique_id = b.id
-- WHERE b.slug LIKE '%-hyd'
-- GROUP BY b.id;
