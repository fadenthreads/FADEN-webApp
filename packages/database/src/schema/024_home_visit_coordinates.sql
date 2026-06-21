-- Home visit map coordinates (run after 023_measurements_and_home_visits.sql)

ALTER TABLE home_measurement_visits
  ADD COLUMN IF NOT EXISTS visit_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS visit_longitude DOUBLE PRECISION;
