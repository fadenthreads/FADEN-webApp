import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@faden/ui", "@faden/utils", "@faden/database", "@faden/types", "@faden/validators"],
  outputFileTracingRoot: monorepoRoot,
};

export default withNextIntl(nextConfig);
