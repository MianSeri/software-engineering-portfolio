"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../NonprofitAuth.module.css";
import { forgotPassword } from "@/lib/authApi";

export default function NonprofitForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      setSuccessMsg(
        res?.message || "If that email exists, a reset link was sent."
      );
    } catch (err: any) {
      setErr(err?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  const showSuccess = Boolean(successMsg);

  return (
    <main className={styles.authPage}>
      <div className={styles.authContainer}>
        <section
          className={`${styles.authCard} ${styles.authSingle} ${styles.authSingleCompact}`}
        >
          <aside className={styles.authAside}>
            <p className={styles.authKicker}>Nonprofit portal</p>
            <h1 className={styles.authTitle}>Forgot your password?</h1>
            <p className={styles.authSub}>
              Enter your nonprofit email. If an account exists, we&apos;ll send
              reset instructions.
            </p>
          </aside>

          <div className={styles.authMain}>
            {!showSuccess ? (
              <>
                <div className={styles.authMainHead}>
                  <h2 className={styles.authH2}>Reset access</h2>
                  <p className={styles.authHint}>
                    We&apos;ll email you a secure reset link.
                  </p>
                </div>

                {err ? <div className={styles.authAlert}>{err}</div> : null}

                <form onSubmit={onSubmit} className={styles.authForm}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@organization.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>

                  <div className={styles.authRow}>
                    <Link href="/nonprofit/login" className={styles.linkBtn}>
                      Back to login
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className={styles.authMainHead}>
                  <h2 className={styles.authH2}>Check your inbox</h2>
                  <p className={styles.authHint}>
                    We&apos;ve processed your request.
                  </p>
                </div>

                <div className={styles.authForm}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email address</label>
                    <div className={styles.readonlyField}>{email}</div>
                  </div>

                  <div className={styles.resetSuccess}>
                    <h3>Reset link sent</h3>
                    <p>
                      If an account exists for <strong>{email}</strong>,
                      you&apos;ll receive an email with reset instructions
                      shortly.
                    </p>
                  </div>

                  <div className={styles.authActions}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => {
                        setSuccessMsg("");
                        setErr("");
                      }}
                    >
                      Send again
                    </button>

                    <Link href="/nonprofit/login" className={styles.link}>
                      Back to login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <p className={`${styles.authFooter} ${styles.small} ${styles.center}`}>
          Secure by design · Built for trust · AlmsLite
        </p>
      </div>
    </main>
  );
}