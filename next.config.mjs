/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // Increase function timeout for AI processing
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
