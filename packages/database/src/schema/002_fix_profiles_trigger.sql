-- Run in Supabase SQL editor if signup fails with "Database error saving new user"
-- Fixes profile bootstrap trigger + RLS for new auth users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('customer', 'boutique_owner', 'admin')
      THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'customer'::user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS profiles_insert_on_signup ON profiles;
CREATE POLICY profiles_insert_on_signup ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
