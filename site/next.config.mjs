/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos servidas pelo back office (proxy_base.php?action=foto). Hosts atual + futuro.
    remotePatterns: [
      { protocol: "https", hostname: "www.virtualnaplanta.com.br" },
      { protocol: "https", hostname: "virtualnaplanta.com.br" },
      { protocol: "https", hostname: "app.naplanta.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
