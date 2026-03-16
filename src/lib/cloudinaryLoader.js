// src/lib/cloudinaryLoader.js
export default function cloudinaryLoader({ src, width, quality }) {
  // If it's already a cloudinary URL, don't modify it or modify its params
  if (src.includes('res.cloudinary.com')) {
    // Basic Cloudinary fetch URL format: 
    // https://res.cloudinary.com/<cloud_name>/image/fetch/w_<width>,q_<quality>/<url>
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drnrwbax3'; // Fallback to the one mapped in .env
    
    // If it's already a fetch URL, just return it to avoid double-fetching
    if (src.includes('/image/fetch/')) return src;

    // Convert standard Claudinary URL to have size params (optional optimize step)
    // For now, if it's an uploaded avatar, just return it.
    return src;
  }

  // If it's a TMDB image, we tried routing it THROUGH cloudinary fetch API to optimize it
  // But the user's Cloudinary account returns 401 Unauthorized, likely due to security settings preventing external fetches.
  // Until that's enabled on their dashboard, we use standard TMDB links (Next.js will just load them normally based on the unoptimized prop we originally replaced, but now using this default loader)
  if (src.startsWith('https://image.tmdb.org/')) {
    return src;
  }

  // Fallback for any other external images or local images
  return src;
}
