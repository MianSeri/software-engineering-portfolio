"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";

type AuthStatus = "checking" | "authed" | "guest";

export function useRequireAuth(loginPath = "/nonprofit/login") {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      const nextUrl = `${loginPath}?next=${encodeURIComponent(pathname)}`;
      setStatus("guest");
      router.replace(nextUrl);
      return;
    }

    setStatus("authed");
  }, [router, loginPath, pathname]);

  return status === "authed";
}