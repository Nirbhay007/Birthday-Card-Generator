/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: '**.r2.dev',
            },
            {
                protocol: 'https',
                hostname: '*.r2.dev',
            },
        ],
    },
};

export default nextConfig;
