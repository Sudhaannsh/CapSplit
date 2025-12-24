import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/activity-images/');
      if (pathParts.length < 2) return false;
      
      const filePath = decodeURIComponent(pathParts[1]);

      const { error } = await supabase.storage
        .from('activity-images')
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error('Image delete failed:', error);
      return false;
    }
  };

  return { uploadImage, deleteImage, uploading };
}
