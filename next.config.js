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


const nextConfig = {
 
  reactStrictMode: true,
  
  images: {
    domains: ['localhost'],
  },
  
  swcMinify: true,
}

module.exports = nextConfig
