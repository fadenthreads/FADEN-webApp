-- Geo coordinates for customer profiles and boutique discovery distance
-- Run after 013_fitting_appointments_owner_book.sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE boutiques
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_boutiques_geo ON boutiques (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Approximate coordinates for Hyderabad seed boutiques
UPDATE boutiques SET latitude = 17.4156, longitude = 78.4487 WHERE slug = 'lakshmi-stitches-hyd';
UPDATE boutiques SET latitude = 17.4225, longitude = 78.4077 WHERE slug = 'royal-threads-hyd';
UPDATE boutiques SET latitude = 17.4400, longitude = 78.3489 WHERE slug = 'saree-sabha-hyd';
UPDATE boutiques SET latitude = 17.4435, longitude = 78.3772 WHERE slug = 'gown-gallery-hyd';
UPDATE boutiques SET latitude = 17.4485, longitude = 78.3908 WHERE slug = 'sharara-house-hyd';
UPDATE boutiques SET latitude = 17.4615, longitude = 78.3670 WHERE slug = 'silk-route-hyd';
UPDATE boutiques SET latitude = 17.4399, longitude = 78.4983 WHERE slug = 'bridal-bloom-hyd';
UPDATE boutiques SET latitude = 17.4449, longitude = 78.4662 WHERE slug = 'anarkali-atelier-hyd';
UPDATE boutiques SET latitude = 17.4375, longitude = 78.4482 WHERE slug = 'fusion-faden-hyd';
UPDATE boutiques SET latitude = 17.3993, longitude = 78.4695 WHERE slug = 'heritage-weaves-hyd';
