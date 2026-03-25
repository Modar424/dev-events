import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
   images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            }
        ]
    },
    allowedDevOrigins: ['192.168.1.10', 'localhost', '127.0.0.1']
};

export default nextConfig;
