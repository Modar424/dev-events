import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;