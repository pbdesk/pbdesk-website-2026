import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToasterProvider } from "@/lib/providers/toaster";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  jsonLdString,
  SITE_AUTHOR,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
} from "@/lib/seo";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR, url: SITE_URL }],
  category: "technology",
  creator: SITE_AUTHOR,
  description: SITE_DEFAULT_DESCRIPTION,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  generator: "Next.js",
  icons: {
    apple: [{ sizes: "180x180", url: "/favicons/apple-touch-icon.png" }],
    icon: [
      { sizes: "32x32", type: "image/png", url: "/favicons/favicon-32x32.png" },
      { sizes: "16x16", type: "image/png", url: "/favicons/favicon-16x16.png" },
    ],
    shortcut: "/favicons/favicon.ico",
  },
  keywords: SITE_KEYWORDS,
  manifest: "/favicons/site.webmanifest",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: SITE_DEFAULT_DESCRIPTION,
    images: [
      {
        alt: `${SITE_NAME} — ${SITE_AUTHOR}`,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        url: DEFAULT_OG_IMAGE,
        width: DEFAULT_OG_IMAGE_WIDTH,
      },
    ],
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_DEFAULT_TITLE,
    type: "website",
    url: SITE_URL,
  },
  publisher: SITE_AUTHOR,
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: SOCIAL.twitterHandle,
    description: SITE_DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    site: SOCIAL.twitterHandle,
    title: SITE_DEFAULT_TITLE,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  initialScale: 1,
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  alternateName: `${SITE_NAME} — ${SITE_AUTHOR}`,
  description: SITE_DEFAULT_DESCRIPTION,
  inLanguage: "en",
  name: SITE_NAME,
  publisher: {
    "@type": "Person",
    name: SITE_AUTHOR,
    sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.x],
    url: SITE_URL,
  },
  url: SITE_URL,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  description:
    "Software engineer, AI tinkerer, and wellness enthusiast writing at PBDesk.",
  jobTitle: "Software Engineer",
  name: SITE_AUTHOR,
  sameAs: [SOCIAL.github, SOCIAL.linkedin, SOCIAL.x],
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col ${onest.variable} ${jetbrainsMono.variable}`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {/* ToasterProvider must render before the children components */}
          {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
          <ToasterProvider />

          <div className="isolate flex flex-1 flex-col">{children}</div>
        </ThemeProvider>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD payload is statically generated and safe.
          dangerouslySetInnerHTML={{
            __html: jsonLdString([websiteJsonLd, personJsonLd]),
          }}
          type="application/ld+json"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
