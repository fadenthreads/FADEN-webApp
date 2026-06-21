import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@faden/ui", "@faden/utils", "@faden/validators", "@faden/database"],
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
