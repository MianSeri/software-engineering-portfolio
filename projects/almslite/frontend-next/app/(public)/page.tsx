// homepage

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCampaigns } from "@/lib/campaigns";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import styles from "./Home.module.css";

function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12l1.8 1.8L15.5 9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart(props: React.SVGProps<SVGSVGElement>) {
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

function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M20 12a8 8 0 10-2.3 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 7v5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCurrency(n: any) {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `$${num}`;
  }
}

function statusLabel(status: any) {
  const s = String(status || "active").toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "paused") return "Paused";
  return "Active";
}

function isUsableImageUrl(url: any) {
  if (!url) return false;
  const u = String(url).trim();
  if (!u) return false;
  if (u.startsWith("file://")) return false;
  if (u.toLowerCase().endsWith(".pdf")) return false;
  return true;
}

function placeholderSvgDataUrl(title = "Campaign") {
  const safe = String(title).slice(0, 40).replace(/&/g, "and").replace(/</g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="45%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#ffe4e6"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5a4"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="260" cy="210" r="160" fill="#0ea5a4" opacity="0.12"/>
    <circle cx="960" cy="240" r="240" fill="#fb7185" opacity="0.10"/>
    <rect x="70" y="420" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.92"/>
    <text x="92" y="457" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="white" font-weight="700">
      Alms
    </text>
    <text x="70" y="335" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="54" fill="#0f172a" font-weight="800">
      ${safe}
    </text>
    <text x="70" y="380" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="24" fill="#475569">
      Add a flyer image anytime.
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCardImgSrc(c: any) {
  const raw = c?.imageUrl;
  if (!isUsableImageUrl(raw)) return placeholderSvgDataUrl(c?.title);
  const resolved = resolveImageUrl(raw);
  return resolved || placeholderSvgDataUrl(c?.title);
}

export default function PublicHomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const targetRaised = 12480;
  const targetDonors = 132;
  const [raisedDisplay, setRaisedDisplay] = useState(0);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getCampaigns();
        const arr = Array.isArray(list) ? list : (list as any)?.campaigns ?? [];
        setCampaigns(arr);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setAnimateIn(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const durationMs = 900;
    const start = performance.now();
    const from = 0;
    const to = targetRaised;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      setRaisedDisplay(value);
      if (t < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const featured = campaigns.slice(0, 3);
  const featuredProgressKey = useMemo(() => (animateIn ? "in" : "out"), [animateIn]);

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.stack}`}>
        <section className={styles.hero}>
          <div className={styles.heroIllus} aria-hidden="true" />

          <div className={`${styles.heroLeft} ${styles.stack}`}>
            <p className={styles.kicker}>Trusted giving, beautifully simple</p>
            <h1 className={styles.heroTitle}>
              Give with confidence. <span className={styles.heroAccent}>See your impact.</span>
            </h1>
            <p className={styles.heroSub}>
              Launch transparent campaigns and empower donors with real-time impact tracking.
            </p>

            <div className={styles.heroCta}>
              <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/campaigns">
                Explore campaigns
              </Link>

              <Link
                className={`${styles.btn} ${styles.btnOutline}`}
                href={hasToken ? "/dashboard" : "/nonprofit/login"}
              >
                {hasToken ? "Go to dashboard" : "For nonprofits"}
              </Link>
            </div>

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <IconShield className={styles.trustIco} />
                <span>Secure payments</span>
              </div>
              <div className={styles.trustItem}>
                <IconChart className={styles.trustIco} />
                <span>Transparent goals</span>
              </div>
              <div className={styles.trustItem}>
                <IconRefresh className={styles.trustIco} />
                <span>Real-time updates</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={`${styles.heroCard} ${animateIn ? styles.in : ""}`}>
              <div className={styles.heroCardTop}>
                <span className={styles.badge}>Impact</span>
                <span className={styles.small}>This month</span>
              </div>

              <div className={styles.heroMetric}>
                <div className={styles.heroMetricNum}>{formatCurrency(raisedDisplay)}</div>
                <div className={styles.small}>Raised this month by {targetDonors} donors.</div>
              </div>

              <div className={`${styles.progress} ${styles.thick}`} style={{ marginTop: 14 }}>
                <span className={animateIn ? styles.barIn : ""} style={{ width: "68%" }} />
              </div>

              <div className={styles.quote}>“Clarity builds trust — and trust increases giving.”</div>
            </div>
          </div>
        </section>

        <section className={`${styles.stack} ${styles.featured}`} style={{ gap: 10 }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2}>Featured campaigns</h2>
            <Link className={`${styles.btn} ${styles.btnGhost}`} href="/campaigns">
              View all
            </Link>
          </div>

          {loading ? (
            <p className={styles.p}>Loading campaigns…</p>
          ) : (
            <div className={styles.grid3}>
              {featured.map((c) => {
                const goal = Number(c.goalAmount || 0);
                const raised = Number(c.amountRaised || 0);
                const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
                const imgSrc = getCardImgSrc(c);
                const badgeText = statusLabel(c.status);

                return (
                  <Link key={c._id} href={`/campaigns/${c._id}`} className={styles.campaignCard}>
                    <div className={styles.campaignImg}>
                      <img
                        src={imgSrc}
                        alt={c.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = placeholderSvgDataUrl(c.title);
                        }}
                      />
                      <div className={styles.campaignImgBadge}>{badgeText}</div>
                    </div>

                    <div className={styles.campaignBody}>
                      <div className={styles.campaignTop}>
                        <div>
                          <div className={styles.campaignTitle}>{c.title}</div>
                          <div className={styles.small}>
                            {badgeText} · {pct}%
                          </div>
                        </div>
                      </div>

                      <div className={`${styles.progress} ${styles.thick}`} data-anim={featuredProgressKey}>
                        <span className={animateIn ? styles.barIn : ""} style={{ width: `${pct}%` }} />
                      </div>

                      <div className={styles.campaignMeta}>
                        <span>
                          <strong>Goal</strong> {formatCurrency(goal)}
                        </span>
                        <span>
                          <strong>Raised</strong> {formatCurrency(raised)}
                        </span>
                      </div>

                      <div className={styles.campaignCta}>
                        <span className={`${styles.btn} ${styles.btnPrimary} ${styles.mini}`}>
                          View & donate
                        </span>
                        <span className={`${styles.btn} ${styles.btnGhost} ${styles.mini}`}>
                          Details
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.how}>
          <h2 className={styles.h2}>How Alms works</h2>
          <div className={styles.howGrid}>
            <div className={styles.howCard}>
              <div className={styles.howNum}>1</div>
              <div className={styles.howTitle}>Discover a cause</div>
              <p className={styles.p}>Browse campaigns and understand exactly what your donation supports.</p>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howNum}>2</div>
              <div className={styles.howTitle}>Give in seconds</div>
              <p className={styles.p}>Fast checkout, secure payments, and a donation experience that feels good.</p>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howNum}>3</div>
              <div className={styles.howTitle}>Track progress</div>
              <p className={styles.p}>See goals and raised amounts update — transparency builds trust.</p>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.small}>© {new Date().getFullYear()} AlmsLite</div>
          <div className={styles.small}>Built for trust, designed for impact.</div>
        </footer>
      </div>
    </div>
  );
}