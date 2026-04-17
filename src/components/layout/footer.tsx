import Image from "next/image";
import Link from "next/link";
import { IconBrandLinkedinFilled, IconBrandGithubFilled, IconBrandX } from '@tabler/icons-react';
import { getCurrentYear } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900">
      <span className="absolute top-0 left-1/2 -translate-x-1/2">
        <svg
          fill="none"
          height="457"
          viewBox="0 0 1260 457"
          width="1260"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_11105_867)">
            <circle cx="630" cy="-173.299" fill="#3B2EFF" r="230" />
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="1260"
              id="filter0_f_11105_867"
              width="1260"
              x="0"
              y="-803.299"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                mode="normal"
                result="shape"
              />
              <feGaussianBlur
                result="effect1_foregroundBlur_11105_867"
                stdDeviation="200"
              />
            </filter>
          </defs>
        </svg>
      </span>
      <div className="relative z-10 py-16 xl:py-24">
        <div className="container mx-auto px-5 sm:px-7">
          <div className="grid gap-x-6 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-3 xl:col-span-4">
              <div>
                <Link className="mb-6 block" href="/">
                  <Image
                    alt="logo"
                    height={60}
                    src="/pb/PBDesk-logo-dark.png"
                    width={210}
                  />
                </Link>
                <p className="mb-9 block text-gray-400 text-sm">
                  Bits & Bites - Developer's Life.
                  <br />
                  Learning Endeavor Forever...from the desk of Pinal Bhatt
                </p>
                <div className="center flex" id="social">
                  <a
                    className="size-10 text-gray-400 hover:text-white/80"
                    href="https://www.linkedin.com/in/pinalbhatt"
                    rel="noopener"
                    target="_blank"
                  >
                    <IconBrandLinkedinFilled />
                  </a>
                  <a
                    className="size-10 text-gray-400 hover:text-white/80"
                    href="https://github.com/pinalbhatt"
                    rel="noopener"
                    target="_blank"
                  >
                    <IconBrandGithubFilled />
                  </a>
                  <a
                    className="size-10 text-gray-400 hover:text-white/80"
                    href="https://x.com/pbdesk"
                    rel="noopener"
                    target="_blank"
                  >
                    <IconBrandX stroke={2} />
                  </a>
                  
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="grid gap-7 sm:grid-cols-3" />
            </div>
            <div className="lg:col-span-3">
              <div>
                <nav className="flex flex-col space-y-3">
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/signin"
                  >
                    Home
                  </Link>
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/signup"
                  >
                    Bits
                  </Link>
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/reset-password"
                  >
                    Bites
                  </Link>
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/contact"
                  >
                    Blog
                  </Link>
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/contact"
                  >
                    About Me
                  </Link>
                  <Link
                    className="font-normal text-gray-400 text-sm transition hover:text-white"
                    href="/contact"
                  >
                    Disclaimer
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-gray-800 border-t">
        <div className="container relative z-10 mx-auto px-5 sm:px-7">
          <div className="py-5 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {getCurrentYear()} PBDesk - All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
