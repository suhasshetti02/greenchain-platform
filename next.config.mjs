/**
 * @type {import('next').NextConfig}
 *
 * Notes:
 * - Remote image hosts listed here must include every donor image provider.
 * - Supabase storage URLs for donation images
 * - Add additional providers if product expands beyond Unsplash.
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
