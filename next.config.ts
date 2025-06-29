import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostname = supabaseUrl ? new URL(supabaseUrl).host : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: hostname
      ? [
          {
            protocol: "https",
            hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
