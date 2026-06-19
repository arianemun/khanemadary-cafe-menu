import createIntlPlugin from "next-intl/plugin";

const withNextIntl = createIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
