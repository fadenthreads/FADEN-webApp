-- Career applications with resume uploads (private documents bucket)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faden-documents',
  'faden-documents',
  false,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role_interest TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_url TEXT,
  cover_note TEXT,
  resume_path TEXT NOT NULL,
  resume_file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_applications_created_at
  ON career_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_career_applications_email
  ON career_applications(email);

ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Inserts and reads are handled via service role on the server (no public policies).
