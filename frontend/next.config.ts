/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/photo',
        destination: 'http://localhost:3001/api/photo',
      },
    ]
  },
}

module.exports = nextConfig