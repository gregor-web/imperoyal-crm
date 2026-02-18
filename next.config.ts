import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://unpkg.com; style-src-elem 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.perplexity.ai wss://*.supabase.co https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org; frame-src 'self' blob:; object-src 'self' blob:; frame-ancestors 'self';",
          },
        ],
      },
      {
        // Block API routes from being cached
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
