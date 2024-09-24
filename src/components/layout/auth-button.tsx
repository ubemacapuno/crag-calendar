"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function AuthButton() {
  const { status } = useSession();

  if (status === "loading") {
    return <p>Loading authentication status...</p>;
  }

  if (status === "authenticated") {
    const signOutClick = () =>
      signOut({
        callbackUrl: "/",
      });

    return <DropdownMenuItem onClick={signOutClick}>Sign Out</DropdownMenuItem>;
  }

  return (
    <Button
      onClick={() =>
        signIn("google", {
          callbackUrl: "/dashboard/profile",
        })
      }
    >
      Sign In
    </Button>
  );
}
