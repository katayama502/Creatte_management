/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Required for Netlify
  output: undefined, // Do NOT use 'export' - we have dynamic routes
};
export default nextConfig;
