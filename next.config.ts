import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Category artwork still comes from Unsplash; product photography is
      // served straight off the CJ Dropshipping CDN, which uses two hostnames.
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cf.cjdropshipping.com', pathname: '/**' },
      { protocol: 'https', hostname: 'oss-cf.cjdropshipping.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
