"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/authApi";
import styles from "../NonprofitAuth.module.css";

export default function ResetPasswordClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        setSuccessMsg("");

        if (!token || !email) {
            setErr("Invalid or incomplete reset link.");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const res = await resetPassword({
                token,
                email,
                password,
            });

            setSuccessMsg(res?.message || "Password reset successfully.");

            setTimeout(() => {
                router.replace("/nonprofit/login");
            }, 1500);
        } catch (e: any) {
            setErr(e?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className={styles.authPage}>
            <div className={styles.authContainer}>
                <section
                    className={`${styles.authCard} ${styles.authSingle} ${styles.authSingleCompact}`}
                >
                    <aside className={styles.authAside}>
                        <p className={styles.authKicker}>Nonprofit Portal</p>
                        <h1 className={styles.authTitle}>Set a new password</h1>
                        <p className={styles.authSub}>
                            Choose a secure new password for your nonprofit account.
                        </p>
                    </aside>

                    <div className={styles.authMain}>
                        <div className={styles.authMainHead}>
                            <h2 className={styles.authH2}>Reset password</h2>
                            <p className={styles.authHint}>
                                Enter and confirm your new password below.
                            </p>
                        </div>

                        {err ? <div className={styles.authAlert}>{err}</div> : null}
                        {successMsg ? (
                            <div className={styles.authSuccess}>{successMsg}</div>
                        ) : null}

                        <form className={styles.authForm} onSubmit={onSubmit}>
                            <div className={styles.field}>
                                <label htmlFor="email" className={styles.label}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="password" className={styles.label}>
                                    New password
                                </label>
                                <div className={styles.passwordInputWrap}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword" className={styles.label}>
                                    Confirm password
                                </label>
                                <div className={styles.passwordInputWrap}>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.btnPrimary}
                            >
                                {loading ? "Updating..." : "Reset password"}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}