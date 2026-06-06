/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["nodemailer", "prisma", "@prisma/client", "yahoo-finance2"],
  },
  webpack: function(config, { isServer }) {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('yahoo-finance2')
    }
    return config
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};
export default nextConfig;
