-- Create storage bucket for activity images
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true);

-- Allow authenticated users to upload their own activity images
CREATE POLICY "Users can upload activity images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activity-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own activity images
CREATE POLICY "Users can update own activity images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'activity-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own activity images
CREATE POLICY "Users can delete own activity images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to activity images
CREATE POLICY "Activity images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'activity-images');