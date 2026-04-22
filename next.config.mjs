/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out', // Explicitly forcing the directory name
  images: {
    unoptimized: true,
  },
};

export default nextConfig;