import type { NextConfig } from "next";

const FALLBACK_DEV_PROXY = "http://localhost:8080";
const FALLBACK_PROD_PROXY =
  process.env.DEFAULT_PROD_API_PROXY_TARGET ??
  "https://backend-production-22ca.up.railway.app";

const resolveProxyTarget = () => {
  const rawTarget =
    process.env.API_PROXY_TARGET ||
    (process.env.NODE_ENV === "production"
      ? FALLBACK_PROD_PROXY
      : FALLBACK_DEV_PROXY);

  return rawTarget.replace(/\/$/, "");
};

const apiProxyTarget = resolveProxyTarget();

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
