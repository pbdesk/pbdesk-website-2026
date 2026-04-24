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
] satisfies NavItem[];

type NavItem = Record<string, string | unknown> &
  (
    | {
        type: "link";
        href: string;
      }
    | {
        type: "dropdown";
      }
  );
