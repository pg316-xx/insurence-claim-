-- Add file_name column to documents table so we can store the original filename
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_name TEXT DEFAULT 'document';

-- Disable RLS on documents table so the backend can freely read/write
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Make sure the claims-docs storage bucket allows uploads and reads
-- Run these ONLY if you haven't already:
CREATE POLICY "allow_public_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'claims-docs');
CREATE POLICY "allow_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'claims-docs');
