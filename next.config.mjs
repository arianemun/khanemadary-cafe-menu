import createIntlPlugin from "next-intl/plugin";

const withNextIntl = createIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // In-memory webpack cache in dev avoids Windows EPERM on .next/cache pack renames
  // and stale chunk refs (Cannot find module './XXXX.js') after HMR.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  // Downlevel ESM + modern syntax in intl deps for older Safari (e.g. iPhone 7 / iOS 12–15).
  transpilePackages: [
    "next-intl",
    "use-intl",
    "intl-messageformat",
    "@formatjs/icu-messageformat-parser",
    "@formatjs/fast-memoize",
    "@formatjs/icu-skeleton-parser",
    "icu-minify",
    "@schummar/icu-type-parser",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.hamkari.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
