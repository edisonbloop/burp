import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/bio",
        destination: "/link",
        permanent: true,
      },
      {
        source: "/talk-it-over",
        destination: "/burp-it",
        permanent: true,
      },
      {
        source: "/talk-it-over/:path*",
        destination: "/burp-it/:path*",
        permanent: true,
      },
      {
        source: "/talkitover",
        destination: "/burp-it",
        permanent: true,
      },
      {
        source: "/talkitover/:path*",
        destination: "/burp-it/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
