-- Repair seed boutique owner logins (run in Supabase SQL Editor).
-- Safe to re-run. Fixes password, email confirmation, token columns, and auth.identities.
--
-- Login: lakshmi.stitches@seed.faden.test (etc.) / SeedPass123!

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix auth.users rows for all seed owners
UPDATE auth.users u
SET
  instance_id = COALESCE(
    u.instance_id,
    (SELECT id FROM auth.instances LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  ),
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = crypt('SeedPass123!', gen_salt('bf')),
  email_confirmed_at = COALESCE(u.email_confirmed_at, now()),
  confirmation_token = '',
  email_change = '',
  email_change_token_new = '',
  recovery_token = '',
  raw_app_meta_data = COALESCE(u.raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
  updated_at = now()
WHERE u.email LIKE '%@seed.faden.test';

-- Remove broken identity rows (if any) and recreate correctly
DELETE FROM auth.identities i
USING auth.users u
WHERE i.user_id = u.id
  AND u.email LIKE '%@seed.faden.test'
  AND i.provider = 'email';

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
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
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email LIKE '%@seed.faden.test';

-- Ensure profiles exist with boutique_owner role
INSERT INTO public.profiles (id, email, full_name, role, location_label)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'boutique_owner'::user_role,
  'Hyderabad'
FROM auth.users u
WHERE u.email LIKE '%@seed.faden.test'
ON CONFLICT (id) DO UPDATE SET
  role = 'boutique_owner'::user_role,
  location_label = COALESCE(profiles.location_label, 'Hyderabad'),
  full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
  updated_at = now();

COMMIT;

-- Verify (expect identity_count = 1 for each):
-- SELECT u.email,
--        u.email_confirmed_at IS NOT NULL AS confirmed,
--        (SELECT count(*) FROM auth.identities i WHERE i.user_id = u.id) AS identity_count,
--        p.role
-- FROM auth.users u
-- LEFT JOIN profiles p ON p.id = u.id
-- WHERE u.email LIKE '%@seed.faden.test'
-- ORDER BY u.email;
