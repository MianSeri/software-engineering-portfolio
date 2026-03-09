"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChangeEvent, FormEvent, SVGProps } from "react";

import { loginNonprofit } from "@/lib/authApi";
import { storeToken } from "@/lib/auth";
import styles from "../NonprofitAuth.module.css";

function IconPencil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 5.5l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 19V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 19h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 15v-5M12 15V7M16 15v-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconReceipt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 7h6M9 11h6M9 15h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NonprofitLoginPage() {
  const router = useRouter();

  const [nextPath, setNextPath] = useState("/dashboard");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/")) {
      setNextPath(next);
    }
  }, []);

  const destination = useMemo(() => nextPath, [nextPath]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const resp = await loginNonprofit(payload);

      const token = resp?.token || resp?.accessToken;
      if (!token) throw new Error("Login succeeded but no token returned");

      storeToken(token);

      if (resp?.nonprofit) {
        localStorage.setItem("nonprofit", JSON.stringify(resp.nonprofit));
      }

      router.replace(destination);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <aside className={styles.authAside}>
            <div className={styles.authKicker}>Nonprofit Portal</div>
            <h1 className={styles.authTitle}>Welcome back</h1>
            <p className={styles.authSub}>
              Manage campaigns, track donations, and build trust with transparent
              progress.
            </p>

            <div className={styles.authBullets}>
              <div className={styles.authBullet}>
                <span className={styles.bulletIcon} aria-hidden="true">
                  <IconPencil className={styles.ico} />
                </span>
                <span>Create and edit campaigns</span>
              </div>

              <div className={styles.authBullet}>
                <span className={styles.bulletIcon} aria-hidden="true">
                  <IconChart className={styles.ico} />
                </span>
                <span>Track progress in real time</span>
              </div>

              <div className={styles.authBullet}>
                <span className={styles.bulletIcon} aria-hidden="true">
                  <IconReceipt className={styles.ico} />
                </span>
                <span>Keep clean donation records</span>
              </div>
            </div>

            <div className={styles.authAsideFooter}>
              <span className={styles.small}>Donor looking to give?</span>{" "}
              <Link className={styles.link} href="/campaigns">
                Explore campaigns
              </Link>
            </div>
          </aside>

          <section className={styles.authMain}>
            <div className={styles.authMainHead}>
              <h2 className={styles.authH2}>Nonprofit login</h2>
              <p className={styles.authHint}>
                Use your nonprofit email and password.
              </p>
            </div>

            {err && <div className={styles.authAlert}>{err}</div>}

            <form className={styles.authForm} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@nonprofit.org"
                  autoComplete="email"
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input
                  className={styles.input}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button
                className={styles.btnPrimary}
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in…" : "Log in"}
              </button>

              <div className={styles.authRow}>
                <Link className={styles.linkBtn} href="/nonprofit/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <p className={`${styles.small} ${styles.center}`}>
                No account yet?{" "}
                <Link className={styles.link} href="/nonprofit/register">
                  Register
                </Link>
              </p>
            </form>
          </section>
        </div>

        <p className={`${styles.small} ${styles.authFooter}`}>
          Secure by design • Built for trust • AlmsLite
        </p>
      </div>
    </div>
  );
}