import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  poweredByHeader: false,
  outputFileTracingIncludes: { "/api/**": ["./public/seed/**/*"] },
};
export default config;
