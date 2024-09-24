"use client";

import Link from "next/link";
import React from "react";

import { Home, LineChart, Package2, PanelLeft, User } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
// import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import AuthButton from "./auth-button";
// import { ModeToggle } from "./mode-toggle";
import { ThemeSwitcher } from "./theme-switcher";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { status } = useSession();

  const menuItems = [
    {
      label: "Home",
      href: "/",
    },
  ];

  if (status === "authenticated") {
    menuItems.push(
      {
        label: "Profile",
        href: "/profile",
      },
      {
        label: "Guestbook",
        href: "/guestbook",
      }
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Meny</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <LineChart className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        {/* <Breadcrumbs /> */}
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <AuthButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeSwitcher showLabel />
        {/* <ModeToggle /> */}
      </div>
    </header>
    // <Navbar onMenuOpenChange={setIsMenuOpen}>
    //   <NavbarContent>
    //     <NavbarMenuToggle
    //       aria-label={isMenuOpen ? "Close menu" : "Open menu"}
    //       className="sm:hidden"
    //     />
    //     <NavbarBrand>
    //       <IconPackage />
    //       <p className="font-bold text-inherit">Next.js Starter</p>
    //     </NavbarBrand>
    //   </NavbarContent>

    //   <NavbarContent className="hidden gap-4 sm:flex" justify="center">
    //     {menuItems.map((item, index) => (
    //       <NavbarItem key={`${item}-${index}`}>
    //         <Link className="w-full" href={item.href} size="lg">
    //           {item.label}
    //         </Link>
    //       </NavbarItem>
    //     ))}
    //     <NavbarItem>
    //       <ThemeSwitcher />
    //     </NavbarItem>
    //     <NavbarItem>
    //       <AuthButton minimal={false} />
    //     </NavbarItem>
    //   </NavbarContent>
    //   <NavbarMenu>
    //     <NavbarMenuItem>
    //       <ThemeSwitcher showLabel />
    //     </NavbarMenuItem>
    //     {menuItems.map((item, index) => (
    //       <NavbarMenuItem key={`${item}-${index}`}>
    //         <Link className="w-full" href={item.href} size="lg">
    //           {item.label}
    //         </Link>
    //       </NavbarMenuItem>
    //     ))}
    //     <NavbarMenuItem>
    //       <AuthButton />
    //     </NavbarMenuItem>
    //   </NavbarMenu>
    // </Navbar>
  );
}
