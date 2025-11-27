/**
 * @type {import('next').NextConfig}
 *
 * Notes:
 * - Remote image hosts listed here must include every donor image provider.
 * - Add additional providers if product expands beyond Unsplash.
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
