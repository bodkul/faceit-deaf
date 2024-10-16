/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'distribution.faceit-cdn.net',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: 'assets.faceit-cdn.net',
                pathname: '/avatars/**',
            }
        ]
    }
};

export default nextConfig;
