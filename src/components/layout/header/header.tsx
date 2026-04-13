"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/icons/icons";
import DesktopNav from "./desktop-nav";
import MainMobileNav from "./main-mobile-nav";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-gray-100 border-b bg-white py-2 lg:py-4 dark:border-gray-800 dark:bg-dark-primary">
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="grid grid-cols-2 items-center lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link className="flex items-end gap-2" href="/">
              <Image
                alt="AiStarterKit Logo"
                className="block dark:hidden"
                height={60}
                src="/pb/pb-logo-1.png"
                width={200}
              />

              <Image
                alt="AiStarterKit Logo"
                className="hidden dark:block"
                height={60}
                src="/pb/pb-logo-1.png"
                width={200}
              />
            </Link>
          </div>

          <DesktopNav />

          <div className="flex items-center gap-4 justify-self-end">
            <ThemeToggle />

            <button
              className="order-last inline-flex shrink-0 items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              type="button"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              className="hidden font-medium text-gray-700 text-sm hover:text-primary-500 lg:block dark:text-gray-400"
              href="/signin"
            >
              Sign In
            </Link>

            <Link
              className="gradient-btn button-bg hidden h-11 items-center rounded-full px-5 py-3 text-sm text-white lg:inline-flex"
              href="/signup"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      <MainMobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}
