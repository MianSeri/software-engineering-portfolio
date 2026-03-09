"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import styles from "./Welcome.module.css";

export default function WelcomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/nonprofit/login");
      return;
    }

    setHasToken(true);
    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth) return null;

  return (
    <main className={styles.welcome}>
      {/* HERO (Nonprofit-first) */}
      <section className={`${styles.welcomeHero} ${styles.welcomeHeroNonprofit}`}>
        <div className={styles.welcomeHeroContent}>
          <p className={styles.welcomeKicker}>
            {hasToken ? "Welcome" : "Get started"}
          </p>

          <h1 className={styles.welcomeTitle}>
            {hasToken ? "Build your next impact." : "Launch campaigns with clarity and trust."}
          </h1>

          <p className={styles.welcomeSubtitle}>
            {hasToken
              ? "Launch your first campaign, track donations, and share a page donors can trust, in minutes."
              : "Create a verified profile, publish your first campaign, and start collecting donations securely."}
          </p>

          <div className={styles.welcomeActions}>
            <Link
              className={`${styles.btn} ${styles.btnPrimary}`}
              href={hasToken ? "/dashboard" : "/nonprofit/register"}
            >
              {hasToken ? "Open dashboard" : "Create nonprofit account"}
            </Link>

            <Link className={`${styles.btn} ${styles.btnGhost}`} href="/campaigns">
              Preview public campaigns
            </Link>

            <Link
              className={`${styles.btn} ${styles.btnLink}`}
              href={hasToken ? "/campaigns/create" : "/nonprofit/login"}
            >
              {hasToken ? "Create a campaign" : "Already have an account? Log in"}
            </Link>
          </div>

          <div className={styles.welcomeMeta}>
            <span className={styles.badge}>Stripe-powered checkout</span>
            <span className={styles.badge}>Receipts &amp; records</span>
            <span className={styles.badge}>Real-time totals</span>
          </div>
        </div>

        <div className={styles.welcomeHeroPanel}>
          <div className={`${styles.panelCard} ${styles.panelCardWorkspace}`}>
            <div className={styles.panelRow}>
              <div className={styles.dot} />
              <div className={styles.panelLines}>
                <div className={`${styles.line} ${styles.lineLg}`} />
                <div className={styles.line} />
              </div>
              <span className={styles.panelChip}>Workspace</span>
            </div>

            <div className={styles.panelStats}>
              <div className={styles.stat}>
                <p className={styles.statLabel}>Donations (30 days)</p>
                <p className={styles.statValue}>$12,480</p>
                <p className={styles.statSub}>132 donors</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>Active campaigns</p>
                <p className={styles.statValue}>3</p>
                <p className={styles.statSub}>1 draft</p>
              </div>
            </div>

            <div className={styles.panelProgress}>
              <div className={styles.progressTop}>
                <span className={styles.progressLabel}>Next milestone</span>
                <span className={styles.progressValue}>68%</span>
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>

              <div className={styles.panelTodos}>
                <div className={styles.todo}>
                  <span className={styles.todoDot} />
                  <span className={styles.todoText}>Finish campaign story</span>
                  <span className={styles.todoTag}>Draft</span>
                </div>
                <div className={styles.todo}>
                  <span className={styles.todoDot} />
                  <span className={styles.todoText}>Add cover image</span>
                  <span className={styles.todoTag}>Recommended</span>
                </div>
                <div className={styles.todo}>
                  <span className={styles.todoDot} />
                  <span className={styles.todoText}>Share campaign link</span>
                  <span className={styles.todoTag}>Ready</span>
                </div>
              </div>

              <Link
                href="/campaigns/create"
                className={`${styles.miniCta} ${styles.miniCtaTeal}`}
              >
                Create campaign
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.welcomeFeatures}>
        <h2 className={styles.sectionTitle}>Built for trust, made for generosity</h2>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <h3>Secure checkout</h3>
            <p>Payments run through Stripe. Donation status is confirmed safely before totals update.</p>
          </article>

          <article className={styles.featureCard}>
            <h3>Verified nonprofits</h3>
            <p>Nonprofits register and manage campaigns through protected dashboards and review steps.</p>
          </article>

          <article className={styles.featureCard}>
            <h3>Transparent progress</h3>
            <p>Track campaign totals and see where your support is going—clearly and consistently.</p>
          </article>
        </div>
      </section>

      <section className={styles.welcomeFooterCta}>
        <div className={styles.footerCta}>
          <div>
            <h2 className={styles.footerTitle}>Ready to make an impact?</h2>
            <p className={styles.footerSubtitle}>Create a campaign in minutes and share a page donors trust.</p>
          </div>

          <div className={styles.footerActions}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/campaigns/create">
              Create a campaign
            </Link>
            <Link className={`${styles.btn} ${styles.btnGhost}`} href="/dashboard">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}