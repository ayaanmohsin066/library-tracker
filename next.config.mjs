/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@splinetool/runtime"],
  webpack: (config) => {
    config.resolve.conditionNames = ["import", "require", "node", "default"];
    return config;
  },
};

export default nextConfig;
