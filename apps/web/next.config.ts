import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@faden/ui", "@faden/utils", "@faden/database", "@faden/types", "@faden/validators"],
};

export default withNextIntl(nextConfig);
