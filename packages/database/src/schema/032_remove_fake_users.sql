-- Remove fake / seed users and their data — keep admin account(s) only.
-- Run in Supabase Dashboard → SQL Editor (postgres role).
--
-- BEFORE RUNNING:
-- 1. Confirm your admin account(s) have role = 'admin' in profiles:
--      SELECT id, email, full_name, role FROM profiles ORDER BY role, email;
-- 2. If your real account is not admin yet, promote it first:
--      UPDATE profiles SET role = 'admin' WHERE email = 'your-real-email@example.com';
-- 3. Review the PREVIEW section below — adjust if needed.
-- 4. This is destructive. Take a backup or run on a staging project first.

-- ── PREVIEW (safe to run — does not delete) ─────────────────────────────────

-- Admin accounts that will be kept
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY email;

-- Non-admin users that will be removed
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role <> 'admin'
ORDER BY u.email;

-- Seed / test accounts (common fake patterns)
SELECT u.id, u.email, p.full_name, p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email LIKE '%@seed.faden.test'
   OR u.email LIKE '%@test.%'
   OR u.email LIKE '%+test@%'
ORDER BY u.email;

-- Counts of data owned by non-admins
SELECT 'orders' AS entity, COUNT(*) AS rows
FROM orders o
WHERE o.customer_id IN (SELECT id FROM profiles WHERE role <> 'admin')
   OR o.boutique_id IN (SELECT id FROM boutiques WHERE owner_id IN (SELECT id FROM profiles WHERE role <> 'admin'))
UNION ALL
SELECT 'boutiques', COUNT(*)
FROM boutiques b
WHERE b.owner_id IN (SELECT id FROM profiles WHERE role <> 'admin')
UNION ALL
SELECT 'customization_requests', COUNT(*)
FROM customization_requests r
WHERE r.customer_id IN (SELECT id FROM profiles WHERE role <> 'admin');

-- ── CLEANUP (destructive — uncomment and run when ready) ────────────────────

/*
BEGIN;

CREATE TEMP TABLE _faden_keep_users ON COMMIT DROP AS
SELECT id FROM profiles WHERE role = 'admin';

-- Block if no admin would remain
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM _faden_keep_users) = 0 THEN
    RAISE EXCEPTION 'No admin profiles found. Promote your account to admin before running cleanup.';
  END IF;
END $$;

-- Remove transactional data tied to non-admin users / fake boutiques
DELETE FROM payments
WHERE order_id IN (
  SELECT o.id FROM orders o
  LEFT JOIN boutiques b ON b.id = o.boutique_id
  WHERE o.customer_id NOT IN (SELECT id FROM _faden_keep_users)
     OR (b.id IS NOT NULL AND b.owner_id NOT IN (SELECT id FROM _faden_keep_users))
);

DELETE FROM order_events
WHERE order_id IN (
  SELECT o.id FROM orders o
  LEFT JOIN boutiques b ON b.id = o.boutique_id
  WHERE o.customer_id NOT IN (SELECT id FROM _faden_keep_users)
     OR (b.id IS NOT NULL AND b.owner_id NOT IN (SELECT id FROM _faden_keep_users))
);

DELETE FROM quotation_line_items
WHERE quotation_id IN (
  SELECT q.id FROM quotations q
  JOIN orders o ON o.id = q.order_id
  LEFT JOIN boutiques b ON b.id = o.boutique_id
  WHERE o.customer_id NOT IN (SELECT id FROM _faden_keep_users)
     OR (b.id IS NOT NULL AND b.owner_id NOT IN (SELECT id FROM _faden_keep_users))
);

DELETE FROM quotations
WHERE order_id IN (
  SELECT o.id FROM orders o
  LEFT JOIN boutiques b ON b.id = o.boutique_id
  WHERE o.customer_id NOT IN (SELECT id FROM _faden_keep_users)
     OR (b.id IS NOT NULL AND b.owner_id NOT IN (SELECT id FROM _faden_keep_users))
);

DELETE FROM messages
WHERE conversation_id IN (
  SELECT c.id FROM conversations c
  WHERE c.customer_id NOT IN (SELECT id FROM _faden_keep_users)
     OR c.boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users))
);

DELETE FROM conversations
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users)
   OR boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM fitting_appointments
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users)
   OR tailor_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM alteration_requests
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM orders
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users)
   OR boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM customization_requests
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users)
   OR boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM reviews
WHERE reviewer_id NOT IN (SELECT id FROM _faden_keep_users)
   OR boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM cart_items
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM wishlist_items
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM material_business_applications
WHERE applicant_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM boutique_modification_requests
WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM customer_measurement_profiles
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users);

DELETE FROM home_measurement_visits
WHERE customer_id NOT IN (SELECT id FROM _faden_keep_users);

-- Remove fake boutiques (after orders are gone)
DELETE FROM boutique_staff
WHERE boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM boutique_portfolio_items
WHERE boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM boutique_verifications
WHERE boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM boutique_outfit_types
WHERE boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM boutique_services
WHERE boutique_id IN (SELECT id FROM boutiques WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users));

DELETE FROM boutiques
WHERE owner_id NOT IN (SELECT id FROM _faden_keep_users);

-- Remove non-admin auth users (profiles cascade from auth.users)
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM _faden_keep_users);

COMMIT;
*/

-- ── Quick seed-only cleanup (optional, if you only want to drop Hyderabad seed) ─

/*
DELETE FROM auth.users
WHERE email LIKE '%@seed.faden.test';
*/
