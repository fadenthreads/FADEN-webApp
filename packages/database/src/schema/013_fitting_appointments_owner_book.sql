-- Allow boutique owners to book video fittings on behalf of customers
-- when linked to a customization request they own.
-- Run after 012_fitting_appointments.sql

DROP POLICY IF EXISTS fitting_appointments_insert ON fitting_appointments;

CREATE POLICY fitting_appointments_insert ON fitting_appointments FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR (
      tailor_id = auth.uid()
      AND customization_request_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM customization_requests r
        INNER JOIN boutiques b ON b.id = r.boutique_id
        WHERE r.id = customization_request_id
          AND r.customer_id = customer_id
          AND r.boutique_id = boutique_id
          AND b.owner_id = auth.uid()
      )
    )
  );
