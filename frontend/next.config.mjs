/** @type {import('next').NextConfig} */
const nextConfig = {
    // REMOVED static export to support dynamic claim pages on Web Service
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
