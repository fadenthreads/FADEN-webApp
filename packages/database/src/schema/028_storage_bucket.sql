-- Supabase Storage bucket for FADEN user-uploaded media
-- Run after 027_alteration_owner_rls.sql
-- Also enable Storage in Supabase Dashboard if the bucket does not appear.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faden-media',
  'faden-media',
  true,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read faden-media" ON storage.objects;
CREATE POLICY "Public read faden-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'faden-media');

DROP POLICY IF EXISTS "Authenticated upload faden-media" ON storage.objects;
CREATE POLICY "Authenticated upload faden-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'faden-media');

DROP POLICY IF EXISTS "Owner update faden-media" ON storage.objects;
CREATE POLICY "Owner update faden-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'faden-media' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'faden-media' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owner delete faden-media" ON storage.objects;
CREATE POLICY "Owner delete faden-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'faden-media' AND auth.uid()::text = (storage.foldername(name))[1]);
