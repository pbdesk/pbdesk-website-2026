"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon } from "@/icons/icons";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

interface MobileMenuProps {
  isOpen: boolean;
}

export default function MainMobileNav({ isOpen }: MobileMenuProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState("");

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? "" : key);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute top-full h-screen w-full border-gray-200 border-b bg-white lg:hidden dark:border-gray-800 dark:bg-dark-primary">
      <div className="flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-4 pt-2 pb-3 sm:px-6">
            {navItems.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    className={cn(
                      "block rounded-md px-3 py-2 font-medium text-gray-500 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      {
                        "text-gray-800 dark:text-white": pathname === item.href,
                      }
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              }

              if (item.type === "dropdown") {
                return (
                  <div key={item.label}>
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-sm" +
                          "text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                        {
                          "text-gray-700 dark:text-gray-200": item.items.some(
                            (subItem) => pathname.includes(subItem.href)
                          ),
                        }
                      )}
                      onClick={() => toggleDropdown(item.label)}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "size-4 transition-transform duration-200",
                          activeDropdown === item.label && "rotate-180"
                        )}
                      >
                        <ChevronDownIcon />
                      </span>
                    </button>

                    {activeDropdown === item.label && (
                      <div className="mt-2 space-y-1 pl-4">
                        {item.items.map((subItem) => (
                          <Link
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-3 py-2 font-medium text-gray-500 text-sm" +
                                "hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                              {
                                "px-2": "icon" in subItem,
                                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200":
                                  pathname.includes(subItem.href),
                              }
                            )}
                            href={subItem.href}
                            key={subItem.href}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* <div className="flex flex-col space-y-3 px-8 pt-2 pb-3">
          <Link
            className="block h-11 w-full rounded-full border border-gray-200 px-5 py-3 text-center font-medium text-gray-700 text-sm hover:text-primary-500 dark:text-gray-400"
            href="/signin"
          >
            Sign In
          </Link>

          <Link
            className="gradient-btn button-bg flex h-11 items-center justify-center rounded-full px-5 py-3 text-sm text-white"
            href="/signup"
          >
            Get Started Free
          </Link>
        </div> */}
      </div>
    </div>
  );
}
