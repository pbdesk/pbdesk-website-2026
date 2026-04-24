import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToasterProvider } from "@/lib/providers/toaster";

const onest = Onest({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Demo AIStarterKit OSS - Next.js AI Starter Kit Demo",
    template: "%s | AIStarterKit OSS Demo",
  },
  description:
    "Demo website of AIStarterKit OSS boilerplate. Built using Next.js, Tailwind CSS, Drizzle ORM, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`flex min-h-screen flex-col bg-gray-50 dark:bg-dark-secondary ${onest.className}`}
      >
        <ThemeProvider disableTransitionOnChange>
          {/* ToasterProvider must render before the children components */}
          {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
          <ToasterProvider />

          <div className="isolate flex flex-1 flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
