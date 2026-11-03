/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* to the Express backend so the browser needs no CORS setup.
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:4000/:path*" }];
  },
};

module.exports = nextConfig;
