export const navItems = [
  {
    type: "link",
    href: "/",
    label: "Home",
  },
  {
    type: "link",
    label: "Bits",
    href: "/text-generator",
  },
  {
    type: "link",
    label: "Bites",
    href: "/pricing",
  },
  {
    type: "link",
    label: "Blog",
    href: "/blog",
  },
  {
    type: "link",
    label: "About Me",
    href: "/contact",
  },
  // {
  //   type: "dropdown",
  //   label: "Pages",
  //   items: [
  //     { href: "/signin", label: "Sign In" },
  //     { href: "/signup", label: "Sign Up" },
  //     { href: "/reset-password", label: "Reset Password" },
  //     { href: "/not-found", label: "404 Error" },
  //   ],
  // },
] as NavItem[];

type NavItem =
  | {
      type: "link";
      href: string;
      label: string;
    }
  | {
      type: "dropdown";
      label: string;
      items: { href: string; label: string }[];
    };
