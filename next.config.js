/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  output: 'standalone',
  serverExternalPackages: ['pg'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
