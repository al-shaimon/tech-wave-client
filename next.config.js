// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add a rule to ignore .map files (for client-side and server-side builds)
    config.module.rules.push({
      test: /\.map$/,
      use: "null-loader",
    });

    // If you need additional exclusions for `chrome-aws-lambda`:
    config.externals = isServer
      ? config.externals.concat("chrome-aws-lambda")
      : config.externals;

    return config;
  },
};

module.exports = nextConfig;
