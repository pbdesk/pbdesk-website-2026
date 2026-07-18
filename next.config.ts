import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/storyblok/image-loader.ts",
    remotePatterns: [
      {
        hostname: "a.storyblok.com",
        pathname: "/f/**",
        protocol: "https",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
