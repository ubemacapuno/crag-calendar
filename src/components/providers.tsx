"use client";

import { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function Providers({ children }: { children: ReactNode }) {
  // const router = useRouter();
  return (
    <SessionProvider>
      {/* <NextUIProvider
        navigate={router.push}
        className="flex h-full w-full flex-col"
      > */}
      <main className="flex h-full w-full flex-col">
        <NextThemesProvider attribute="class">{children}</NextThemesProvider>
      </main>
      {/* </NextUIProvider> */}
    </SessionProvider>
  );
}
