"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredToken, logoutClient } from "@/lib/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(Boolean(getStoredToken()));
    sync();

    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  function handleLogout() {
    logoutClient();
    setAuthed(false);
    router.push("/");
  }

  const logoHref = authed ? "/welcome" : "/";

  return (
    <header className={styles.navWrap}>
      <nav className={styles.navbar}>
        <Link href={logoHref} className={styles.brand} aria-label="Alms home">
          <Image
            src="/alms-icon-only-transparent.png"
            alt="Alms logo"
            width={64}
            height={64}
            priority
            className={styles.brandLogo}
          />
          <span className={styles.brandText}>Alms Lite</span>
        </Link>

        <div className={styles.links}>
          {!authed ? (
            <>
              <Link
                href="/"
                className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
              >
                Home
              </Link>
              <Link
                href="/campaigns"
                className={`${styles.link} ${pathname?.startsWith("/campaigns") ? styles.active : ""
                  }`}
              >
                Campaigns
              </Link>
              <Link
                href="/nonprofit/login"
                className={`${styles.link} ${pathname?.startsWith("/nonprofit/login") ? styles.active : ""
                  }`}
              >
                Nonprofit Login
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/welcome"
                className={`${styles.link} ${pathname === "/welcome" ? styles.active : ""}`}
              >
                Home
              </Link>
              <Link
                href="/campaigns/my"
                className={`${styles.link} ${pathname?.startsWith("/campaigns/my") ? styles.active : ""
                  }`}
              >
                Campaigns
              </Link>
              <Link
                href="/campaigns/create"
                className={`${styles.link} ${pathname?.startsWith("/campaigns/create") ? styles.active : ""
                  }`}
              >
                Create Campaign
              </Link>
              <Link
                href="/dashboard"
                className={`${styles.link} ${pathname?.startsWith("/dashboard") ? styles.active : ""
                  }`}
              >
                Dashboard
              </Link>
              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}