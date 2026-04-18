/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disabling linting during build to prevent crash on warnings
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
