import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToasterProvider } from "@/lib/providers/toaster";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: {
    default: "PBDesk — Bits, Bites & Blog",
    template: "%s | PBDesk",
  },
  description:
    "From the desk of Pinal Bhatt — a space where code meets wellness. Bits (dev & AI), Bites (fitness & mindfulness), Blog (long-form reflections).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${onest.variable}`}>
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
