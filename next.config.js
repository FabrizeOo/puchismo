/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    unoptimized: true,
  },
  compress: true,
  async redirects() {
    return [
      {
        source: '/inicio',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
