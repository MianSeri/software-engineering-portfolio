"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// From app/nonprofit/register/page.tsx -> app/nonprofit/NonprofitAuth.module.css
import styles from "../NonprofitAuth.module.css";

import { registerNonprofit } from "@/lib/authApi";
import { storeToken, storeNonprofit } from "@/lib/auth";

function passwordChecks(pw: string) {
  const s = String(pw || "");
  return {
    length: s.length >= 8,
    lower: /[a-z]/.test(s),
    upper: /[A-Z]/.test(s),
    number: /\d/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
}

export default function NonprofitRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const checks = useMemo(() => passwordChecks(form.password), [form.password]);

  const passwordOk =
    checks.length && checks.lower && checks.upper && checks.number && checks.special;

  const emailOk = useMemo(() => {
    const e = String(form.email || "").trim();
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [form.email]);

  const canSubmit =
    !loading && form.name.trim().length > 1 && emailOk && passwordOk;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErr("");
    setSuccessMsg("");

    try {
      const payload = {
        organizationName: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        // NOTE: description is optional — only send if your backend supports it.
        // description: form.description.trim() || undefined,
      };

      const resp: any = await registerNonprofit(payload);

      // If backend returns token (common), store it.
      const token = resp?.token || resp?.accessToken;
      if (token) storeToken(token);

      // If backend returns nonprofit info, store it.
      if (resp?.nonprofit) storeNonprofit(resp.nonprofit);

      setSuccessMsg("Account created. Redirecting to your welcome page…");

      window.setTimeout(() => {
        router.replace("/welcome");
      }, 650);
    } catch (error: any) {
      setErr(error?.data?.error || error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* LEFT SIDE */}
          <aside className={styles.authAside}>
            <div className={styles.authKicker}>Nonprofit Portal</div>
            <h1 className={styles.authTitle}>Start fundraising</h1>
            <p className={styles.authSub}>
              Create your nonprofit account and launch transparent campaigns in
              minutes.
            </p>

            <div className={styles.authBullets}>
              <div className={styles.authBullet}>
                <span className={styles.bulletIcon}>✓</span>
                <span>Launch campaigns instantly</span>
              </div>

              <div className={styles.authBullet}>
                <span className={styles.bulletIcon}>✓</span>
                <span>Track donations in real time</span>
              </div>

              <div className={styles.authBullet}>
                <span className={styles.bulletIcon}>✓</span>
                <span>Build donor trust with transparency</span>
              </div>
            </div>

            <div className={styles.authAsideFooter}>
              Already fundraising?{" "}
              <Link className={styles.link} href="/nonprofit/login">
                Log in
              </Link>
            </div>
          </aside>

          {/* RIGHT SIDE FORM */}
          <section className={styles.authMain}>
            <div className={styles.authMainHead}>
              <h2 className={styles.authH2}>Create your nonprofit account</h2>
              <p className={styles.authHint}>It takes less than 2 minutes.</p>
            </div>

            {err && <div className={styles.authAlert}>{err}</div>}
            {successMsg && (
              <div className={styles.authSuccess}>{successMsg}</div>
            )}

            <form className={styles.authForm} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Organization name</span>
                <input
                  className={styles.input}
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="e.g., Bien-Être Foundation"
                  autoComplete="organization"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="name@nonprofit.org"
                  autoComplete="email"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Password</span>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <div
                  className={styles.authPwRules}
                  aria-label="Password requirements"
                >
                  <div
                    className={`${styles.authRule} ${
                      checks.length ? styles.ok : ""
                    }`}
                  >
                    {checks.length ? "✓" : "•"} 8+ characters
                  </div>
                  <div
                    className={`${styles.authRule} ${
                      checks.upper ? styles.ok : ""
                    }`}
                  >
                    {checks.upper ? "✓" : "•"} 1 uppercase letter
                  </div>
                  <div
                    className={`${styles.authRule} ${
                      checks.lower ? styles.ok : ""
                    }`}
                  >
                    {checks.lower ? "✓" : "•"} 1 lowercase letter
                  </div>
                  <div
                    className={`${styles.authRule} ${
                      checks.number ? styles.ok : ""
                    }`}
                  >
                    {checks.number ? "✓" : "•"} 1 number
                  </div>
                  <div
                    className={`${styles.authRule} ${
                      checks.special ? styles.ok : ""
                    }`}
                  >
                    {checks.special ? "✓" : "•"} 1 special character
                  </div>
                </div>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Description (optional)</span>
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={3}
                  placeholder="Short mission statement (optional)"
                />
              </label>

              <button
                className={styles.btnPrimary}
                type="submit"
                disabled={!canSubmit}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>

              <p
                className={`${styles.small} ${styles.center}`}
                style={{ marginTop: 10, opacity: 0.8 }}
              >
                Security note: passwords are hashed (bcrypt) and never stored in
                plain text.
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