-- FADEN: Video fitting appointments (Cal.com + Daily.co)
-- Run after 001_phase2.sql and prior migrations.

CREATE TYPE fitting_appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Optional Cal.com routing per boutique (falls back to env defaults)
ALTER TABLE boutiques
  ADD COLUMN IF NOT EXISTS cal_username TEXT,
  ADD COLUMN IF NOT EXISTS cal_event_type_slug TEXT;

CREATE TABLE fitting_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tailor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boutique_id UUID NOT NULL REFERENCES boutiques(id) ON DELETE CASCADE,
  customization_request_id UUID REFERENCES customization_requests(id) ON DELETE SET NULL,
  cal_booking_id TEXT,
  cal_booking_uid TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  daily_room_name TEXT,
  daily_room_url TEXT,
  status fitting_appointment_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fitting_appointments_customer ON fitting_appointments(customer_id);
CREATE INDEX idx_fitting_appointments_tailor ON fitting_appointments(tailor_id);
CREATE INDEX idx_fitting_appointments_boutique ON fitting_appointments(boutique_id);
CREATE INDEX idx_fitting_appointments_start ON fitting_appointments(scheduled_start);
CREATE UNIQUE INDEX idx_fitting_appointments_cal_uid ON fitting_appointments(cal_booking_uid)
  WHERE cal_booking_uid IS NOT NULL;

ALTER TABLE fitting_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY fitting_appointments_select ON fitting_appointments FOR SELECT
  USING (
    customer_id = auth.uid()
    OR tailor_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY fitting_appointments_insert ON fitting_appointments FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY fitting_appointments_update ON fitting_appointments FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR tailor_id = auth.uid()
    OR is_admin()
  );
