import { createClient } from "./client";

/**
 * Uploads media files (JPG, PNG, WebP) directly to Supabase Storage bucket 'salon-media'
 * Returns the permanent public CDN URL
 */
export async function uploadSalonMedia(
  file: File | Blob,
  path: string = "services",
  fileName?: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return { error: "Supabase client not initialized" };
    }

    const ext = file.type.split("/")[1] || "jpg";
    const cleanName = fileName || `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const fullPath = `${path}/${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("salon-media")
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      // Fallback: If bucket doesn't exist yet, return helpful message
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from("salon-media").getPublicUrl(fullPath);
    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err.message || "Failed to upload image" };
  }
}
