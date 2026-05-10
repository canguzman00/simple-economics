/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["nodemailer", "prisma", "@prisma/client"],
  images: {
    remotePatterns: [
      {
        // Google profile avatars (OAuth sign-in)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // YouTube standard thumbnails
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        // YouTube high-res thumbnails
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
