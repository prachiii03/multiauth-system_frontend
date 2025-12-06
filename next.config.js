// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'https://multiauth-system-backend-f3oe.vercel.app/api/:path*',
//       },
//     ];
//   },
// }

// module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove rewrites - we'll use direct API calls instead
  // This is better for Vercel deployment
  reactStrictMode: true,
  
  // Optional: Add image domains if you're using Next.js Image component
  images: {
    domains: ['localhost'],
  },
  
  // Optional: For better performance
  swcMinify: true,
}

module.exports = nextConfig