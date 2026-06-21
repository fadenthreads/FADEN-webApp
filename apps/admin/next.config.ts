import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@faden/ui", "@faden/utils", "@faden/validators", "@faden/database"],
};

export default nextConfig;
