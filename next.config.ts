import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google profile pictures
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // For fallback avatars
        port: '',
      },
    ],
  },
  output: 'export', // Add this if you plan to export as a static site
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;