/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      // Officer photos and gallery uploads from the admin panel (Supabase Storage, public bucket)
      { protocol: 'https', hostname: 'nuqwraryiaglcphgkzyr.supabase.co', pathname: '/storage/v1/object/public/site-media/**' },
    ],
  },
};
module.exports = nextConfig;
