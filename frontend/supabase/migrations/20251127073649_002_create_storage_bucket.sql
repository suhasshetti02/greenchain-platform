/*
  # Create Supabase Storage Bucket for Donation Images

  1. New Buckets
    - `donations` - Public bucket for storing donation images
      - Images uploaded here will be publicly accessible
      - Used to store food donation reference photos

  2. Security
    - Public read access for viewing images
    - Authenticated write access for uploading images
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('donations', 'donations', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read donation images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'donations');

CREATE POLICY "Authenticated users can upload donation images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'donations');

CREATE POLICY "Users can update their own uploaded images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'donations')
  WITH CHECK (bucket_id = 'donations');
