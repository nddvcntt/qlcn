import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Prisma needs to be transpiled for serverless
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Disable telemetry in production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;
