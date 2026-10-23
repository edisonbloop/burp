import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Birthday card photos are compressed in the browser to < 1 MB, then sent
    // through a server action; leave headroom for the multipart overhead.
    serverActions: { bodySizeLimit: "2mb" },
  },
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
