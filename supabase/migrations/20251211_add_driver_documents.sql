-- ============================================================
-- Migration: Add Driver Documents Table and Storage Bucket
-- Date: 2025-12-11
-- ============================================================

-- 1. Create a Storage Bucket for Driver Documents
-- Note: 'driver-documents' bucket needed for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-documents', 'driver-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files to this bucket
CREATE POLICY "Drivers can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'driver-documents' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow users to see their own uploaded files (or admins)
CREATE POLICY "Drivers can view their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'driver-documents' 
    AND auth.uid() = owner
  );

-- 2. Create driver_documents table to track file references
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_profile_id UUID REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- e.g., 'LICENSE_FRONT', 'LICENSE_BACK', 'REGISTRATION', 'INSURANCE', 'SELFIE'
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path for deletion
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on driver_documents
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for driver_documents

-- Drivers can view their own documents (via driver_profiles -> user_id)
CREATE POLICY "Drivers can view their own document records"
  ON public.driver_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = driver_documents.driver_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- Drivers can insert their own documents
-- Checking if the profile belongs to them is tricky on insert because we need to look up the profile ID
-- Simplest is to allow insert if the linked profile belongs to auth.uid()
CREATE POLICY "Drivers can insert their own document records"
  ON public.driver_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = driver_documents.driver_profile_id
      AND dp.user_id = auth.uid()
    )
  );
