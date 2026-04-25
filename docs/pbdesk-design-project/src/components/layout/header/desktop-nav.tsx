import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown2Icon } from "@/icons/icons";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export default function DesktopNav() {
  const pathname = usePathname();
  const [activeDropdownKey, setActiveDropdownKey] = useState("");

  function toggleActiveDropdown(key: string) {
    setActiveDropdownKey((prevKey) => (prevKey === key ? "" : key));
  }

  useEffect(() => {
    // Hide dropdown on pathname changes
    setActiveDropdownKey("");
  }, [pathname]);

  return (
    <nav className="hidden max-h-fit rounded-full bg-[#F9FAFB] p-1 lg:flex lg:items-center dark:bg-white/3">
      {navItems.map((item) => {
        if (item.type === "link") {
          return (
            <Link
              className={cn(
                "rounded-full px-4 py-1.5 font-medium text-gray-500 text-sm hover:text-primary-500 dark:text-gray-400",
                {
                  "bg-white font-medium text-gray-800 shadow-xs dark:bg-white/5 dark:text-white/90":
                    pathname === item.href,
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
          const toggleThisDropdown = () => {
            toggleActiveDropdown(item.label);
          };

          const isDropdownActive = activeDropdownKey === item.label;

          return (
            <div className="relative" key={item.label}>
              <button
                className={cn(
                  "group inline-flex items-center gap-1 rounded-full px-4 py-1.5 font-medium text-gray-500 text-sm hover:text-primary-500 dark:text-gray-400",
                  {
                    "bg-white font-medium text-gray-800 shadow-xs dark:bg-white/5 dark:text-white/90":
                      item.items.some(({ href }) => pathname?.includes(href)),
                  }
                )}
                onClick={toggleThisDropdown}
                onKeyDown={(e) => {
                  if (isDropdownActive && e.key === "Escape") {
                    toggleThisDropdown();
                  }
                }}
                onMouseEnter={toggleThisDropdown}
                onMouseLeave={toggleThisDropdown}
              >
                <span>{item.label}</span>
                <ChevronDown2Icon
                  className={cn("size-4 transition-transform duration-200", {
                    "rotate-180": isDropdownActive,
                  })}
                />
              </button>

              {isDropdownActive && (
                <div
                  className="absolute right-0 z-50 w-[266px] rounded-2xl border border-gray-100 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-dark-secondary"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      toggleThisDropdown();
                    }
                  }}
                  onMouseEnter={toggleThisDropdown}
                  onMouseLeave={toggleThisDropdown}
                >
                  <div className="space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        className="flex items-center rounded-lg px-4 py-3 font-medium text-gray-500 text-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                        href={subItem.href}
                        key={subItem.href}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
      })}
    </nav>
  );
}
