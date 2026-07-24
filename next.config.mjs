/** @type {import('next').NextConfig} */

// Security headers applied to every response
const securityHeaders = [
  // Prevent DNS pre-fetching leaks
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  // Disallow framing by other origins
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Limit referrer info sent cross-origin
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Restrict API/sensor access
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Force HTTPS for 2 years (only active over HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content-Security-Policy — tightly scoped
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: Next.js chunks + Razorpay checkout
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com",
      // Styles: self + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images: Firebase Storage + CDN photos + data URIs
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://images.pexels.com https://images.unsplash.com",
      // Network requests: Firebase + our API + Razorpay + Telegram + Gemini
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://api.razorpay.com https://api.telegram.org https://generativelanguage.googleapis.com",
      // Razorpay iframe
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      // Disallow everything else
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Prevent IE-specific XSS attacks
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
  // ── Core ──────────────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,   // hide "X-Powered-By: Next.js"
  compress: true,            // gzip/brotli at edge

  // ── Images ─────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Responsive breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    // Aggressive caching — images don't change often
    minimumCacheTTL: 86400,          // 24 h
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },

  // ── Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Long-cache for immutable Next.js static chunks
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Never cache the service worker
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      // Reasonable cache for manifest
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },

  // ── Redirects ───────────────────────────────────────────────────
  async redirects() {
    return [
      // Canonical: drop trailing slash
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },

  // ── Experimental / Optimisations ────────────────────────────────
  experimental: {
    // Larger body limit for OCR/biodata file uploads
    serverActions: { bodySizeLimit: "5mb" },
    // Tree-shake large icon/animation libraries
    optimizePackageImports: ["lucide-react", "framer-motion", "@google/generative-ai"],
    // Partial pre-rendering (Next 14 PPR — opt-in)
    // ppr: true,  // enable when upgrading to Next 15
  },

  // ── Webpack ─────────────────────────────────────────────────────
  webpack(config, { isServer }) {
    // Suppress "require" warnings from pdf-parse + tesseract (Node-only)
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "canvas",
        "jsdom",
      ];
    }

    // Don't bundle Playwright in production
    config.plugins?.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap("IgnorePlaywright", (nmf) => {
          nmf.hooks.beforeResolve.tap("IgnorePlaywright", (resolveData) => {
            if (resolveData?.request?.includes("playwright")) {
              return false;
            }
          });
        });
      },
    });

    return config;
  },
};

export default nextConfig;
