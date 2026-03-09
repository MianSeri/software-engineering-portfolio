"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRequireAuth } from "@/lib/requireAuth";
import { getMyCampaigns } from "@/lib/campaigns";
import { deleteMyNonprofit } from "@/lib/nonprofits";
import { clearToken } from "@/lib/auth";

import "./Dashboard.css";

type Campaign = any;

function formatMoney(n: any) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clampPct(n: any) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, x));
}

function campaignPct(raised: any, goal: any) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return clampPct(Math.round((r / g) * 100));
}

function readStoredNonprofit(): any | null {
  try {
    const raw = localStorage.getItem("nonprofit");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearNonprofitStorage() {
  localStorage.removeItem("nonprofit");
}

export default function DashboardPage() {
  const router = useRouter();
  const requireOk = useRequireAuth("/nonprofit/login");

  const [hydrated, setHydrated] = useState(false);
  const [nonprofit, setNonprofit] = useState<any | null>(null);

  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [justRefreshed, setJustRefreshed] = useState(false);

  const [dangerErr, setDangerErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setNonprofit(readStoredNonprofit());
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    clearNonprofitStorage();
    router.replace("/nonprofit/login");
  }, [router]);

  const reload = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getMyCampaigns();
      const list = (data as any)?.campaigns ?? data;
      setMyCampaigns(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load your campaigns");
      setMyCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setJustRefreshed(true);
    await reload();

    if (typeof window !== "undefined") {
      window.setTimeout(() => setJustRefreshed(false), 260);
    } else {
      setJustRefreshed(false);
    }
  }, [reload]);

  useEffect(() => {
    if (!hydrated) return;
    if (!requireOk) return;
    reload();
  }, [hydrated, requireOk, reload]);

  const handleDeleteAccount = useCallback(async () => {
    if (typeof window === "undefined") return;

    const ok = window.confirm("Delete your nonprofit account? This cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    setDangerErr("");

    try {
      await deleteMyNonprofit();
      clearToken();
      clearNonprofitStorage();
      router.replace("/");
    } catch (e: any) {
      setDangerErr(e?.data?.error || e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [router]);

  const computed = useMemo(() => {
    const totalCount = myCampaigns.length;

    const activeCampaigns = myCampaigns.filter(
      (c: any) => (c?.status || "active") === "active"
    );

    const totalRaised = myCampaigns.reduce(
      (sum: number, c: any) => sum + Number(c?.amountRaised || 0),
      0
    );

    const totalGoal = myCampaigns.reduce(
      (sum: number, c: any) => sum + Number(c?.goalAmount || 0),
      0
    );

    const remaining = Math.max(0, totalGoal - totalRaised);
    const overallPct = totalGoal
      ? clampPct(Math.round((totalRaised / totalGoal) * 100))
      : 0;

    const needsAttention = activeCampaigns.filter((c: any) => {
      const pct = campaignPct(c?.amountRaised, c?.goalAmount);
      return pct > 0 && pct < 25;
    });

    const nearGoal = activeCampaigns.filter((c: any) => {
      const pct = campaignPct(c?.amountRaised, c?.goalAmount);
      return pct >= 75 && pct < 100;
    });

    const missingImage = myCampaigns.filter((c: any) => !c?.imageUrl);
    const missingDescription = myCampaigns.filter((c: any) => !c?.description);

    const suggestions: any[] = [];

    if (missingImage.length) {
      suggestions.push({
        key: "add-images",
        title: "Add campaign images",
        detail: `${missingImage.length} campaign${missingImage.length === 1 ? "" : "s"} missing an image.`,
        ctaLabel: "Manage campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (missingDescription.length) {
      suggestions.push({
        key: "add-descriptions",
        title: "Strengthen descriptions",
        detail: `${missingDescription.length} campaign${missingDescription.length === 1 ? "" : "s"} missing a description.`,
        ctaLabel: "Manage campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (nearGoal.length) {
      suggestions.push({
        key: "final-push",
        title: "Run a final push",
        detail: `${nearGoal.length} campaign${nearGoal.length === 1 ? "" : "s"} are 75%+ funded.`,
        ctaLabel: "View campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (needsAttention.length) {
      suggestions.push({
        key: "needs-attention",
        title: "Review low-progress campaigns",
        detail: `${needsAttention.length} active campaign${needsAttention.length === 1 ? "" : "s"} under 25% funded.`,
        ctaLabel: "View campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (!totalCount) {
      suggestions.push({
        key: "create-first",
        title: "Create your first campaign",
        detail: "Start with a clear goal, a strong image, and a short story.",
        ctaLabel: "Create a campaign",
        ctaTo: "/campaigns/create",
      });
    }

    let insightTitle = "All set";
    let insightSub = "No high-priority actions right now.";

    if (suggestions.length) {
      insightTitle = `${suggestions.length} suggested action${suggestions.length === 1 ? "" : "s"}`;
      insightSub = suggestions[0].title;
    }

    const primaryCampaign =
      nearGoal[0] ||
      activeCampaigns
        .slice()
        .sort(
          (a: any, b: any) =>
            Number(b?.amountRaised || 0) - Number(a?.amountRaised || 0)
        )[0] ||
      myCampaigns[0] ||
      null;

    const primaryCampaignId = primaryCampaign?._id || null;

    return {
      totalCount,
      totalRaised,
      totalGoal,
      remaining,
      overallPct,
      suggestions,
      insightTitle,
      insightSub,
      primaryCampaignId,
      primaryCampaignTitle: primaryCampaign?.title || null,
    };
  }, [myCampaigns]);

  const orgName = nonprofit?.organizationName || nonprofit?.email || "Nonprofit";
  const hasCampaigns = computed.totalCount > 0;

  if (!hydrated) return null;
  if (!requireOk) return null;

  if (!loading && !hasCampaigns) {
    return (
      <div className="page">
        <div className="container">
          <div className="stack" style={{ gap: 16 }}>
            <div className="card card-pad dash-emptyHero">
              <div className="dash-emptyHeroGrid">
                <div>
                  <p className="dash-kicker">Workspace</p>
                  <h1 className="h1 dash-title">{orgName} — Getting started</h1>

                  <p className="p dash-subtitle">
                    Create your first campaign to start collecting donations and build trust with
                    transparent progress.
                  </p>

                  <div className="dash-actions">
                    <Link className="btn btn-primary" href="/campaigns/create">
                      Create your first campaign
                    </Link>

                    <Link className="btn btn-ghost" href="/campaigns">
                      Preview public view
                    </Link>

                    <button
                      className="iconBtn"
                      type="button"
                      onClick={handleRefresh}
                      disabled={loading}
                      aria-label="Refresh"
                      title="Refresh"
                    >
                      ↻
                    </button>

                    <button
                      className="iconBtn iconBtn--danger"
                      type="button"
                      onClick={handleLogout}
                      aria-label="Logout"
                      title="Logout"
                    >
                      ⎋
                    </button>
                  </div>

                  <div className="dash-meta">
                    <span className="badge">Stripe-ready</span>
                    <span className="badge">Receipts &amp; records</span>
                    <span className="badge">Shareable campaign page</span>
                  </div>

                  {error && (
                    <div className="alert alert-error" style={{ marginTop: 12 }}>
                      Error: {error}
                    </div>
                  )}
                </div>

                <div className="dash-checkCard">
                  <div className="dash-checkHead">
                    <span className="dash-pill">Quick start</span>
                    <span className="dash-muted">~ 3 minutes</span>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Create a campaign</div>
                      <div className="dash-checkDesc">Add a title, goal, and short story.</div>
                    </div>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Add a cover image</div>
                      <div className="dash-checkDesc">Images increase trust and conversion.</div>
                    </div>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Share your link</div>
                      <div className="dash-checkDesc">Post to WhatsApp, email, or social.</div>
                    </div>
                  </div>

                  <Link
                    className="btn btn-primary"
                    href="/campaigns/create"
                    style={{ width: "100%", marginTop: 12 }}
                  >
                    Create campaign
                  </Link>

                  <div className="dash-checkFoot">
                    <span className="small dash-muted">
                      Once created, your campaign will appear below.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-pad dash-emptyCampaigns">
              <div className="dash-emptyCampaignsRow">
                <h2 className="h2 dash-h2">Your campaigns</h2>
                <Link className="btn btn-ghost" href="/campaigns/create">
                  Create
                </Link>
              </div>

              <p className="p dash-muted" style={{ marginTop: 10 }}>
                No campaigns yet — create one to unlock analytics and AI insights.
              </p>
            </div>

            <div className="card card-pad stack dash-danger">
            <div className="section-head">
              <h2 className="h2">Danger zone</h2>
            </div>

            <p className="p dash-muted" style={{ marginTop: -6 }}>
              Permanently delete your nonprofit account. This cannot be undone.
            </p>

            {dangerErr ? <div className="alert alert-error">Error: {dangerErr}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                title="Delete account"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>

              <span className="small dash-muted" style={{ alignSelf: "center" }}>
                Tip: use this to clean up test accounts before demo day.
              </span>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="stack" style={{ gap: 16 }}>
          <div className="card card-pad stack">
            <div className="dash-headRow">
              <div>
                <h1 className="h1" style={{ marginBottom: 0 }}>
                  {orgName} — Performance Overview
                </h1>

                <p className="p" style={{ marginTop: 6 }}>
                  Overall progress: <strong>{computed.overallPct}%</strong>
                  {computed.totalGoal ? (
                    <>
                      {" "}
                      · Remaining: <strong>${formatMoney(computed.remaining)}</strong>
                    </>
                  ) : null}
                </p>

                <div className="dash-secondaryLinks">
                  <Link className="dash-link" href="/campaigns">
                    View public directory →
                  </Link>
                </div>
              </div>

              <div className="dashTopActions">
                <Link className="btn btn-primary" href="/campaigns/create">
                  Create a campaign
                </Link>

                <Link className="btn btn-ghost" href="/campaigns/my">
                  Manage campaigns
                </Link>

                <div className="dashIconGroup" role="group" aria-label="Dashboard utilities">
                  <button
                    className="iconBtn"
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Refresh dashboard"
                    title="Refresh"
                  >
                    ↻
                  </button>

                  <button
                    className="iconBtn iconBtn--danger"
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                  >
                    ⎋
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-error">Error: {error}</div>}
          </div>

          <div className={`ai-metrics ${justRefreshed ? "refresh-fade" : ""}`}>
            <div className="ai-metrics-left">
              <div className="card card-pad ai-stat" style={{ minHeight: 138, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="small" style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", color: "#6b7280" }}>
                  Total Raised</div>
                <div className="ai-statValue" style={{ marginTop: 6, fontSize: "clamp(2.35rem, 3vw, 3.1rem)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 800, color: "#1b2640" }}>
                  ${formatMoney(computed.totalRaised)}</div>
                <div className="small ai-statMeta" style={{ marginTop: 6, fontSize: "0.95rem", lineHeight: 1.45, color: "#667085" }}>
                  Across {computed.totalCount} campaign{computed.totalCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="card card-pad ai-stat" style={{ minHeight: 128, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="small">Remaining</div>
                <div className="ai-statValue">${formatMoney(computed.remaining)}</div>
                <div className="small ai-statMeta" style={{ marginTop: 6,fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", color: "#6b7280" }}>
                  Goal: ${formatMoney(computed.totalGoal)} · {computed.overallPct}% funded
                </div>
                <div className="ai-statProgress">
                  <span style={{ width: `${computed.overallPct}%` }} />
                  </div>
              </div>
            </div>

            

            <div
            className={`card card-pad stat-impact ai-insights ${
              computed.suggestions.length ? "" : "ai-insights--calm"
              }`}
            >
              <div className="ai-insights__eyebrow">AI Insights</div>
              <div className="ai-insights__title">
                {computed.insightTitle}
                </div>
                <div className="ai-insights__text">
                  {computed.insightSub}
                  </div>

              {!computed.suggestions.length && computed.primaryCampaignId ? (
                <div style={{ marginTop: 12 }}>
                  <Link className="btn btn-ghost" href={`/campaigns/${computed.primaryCampaignId}`}>
                    Open campaign
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={`card card-pad stack ai-panel ai-panel-orb ${
              justRefreshed ? "refresh-fade" : ""
            }`}
          >
            <div className="section-head">
              <h2 className="h2">
                Recommended next steps <span className="ai-pill">System guidance</span>
              </h2>
              <Link className="btn btn-ghost" href="/campaigns/my">
                Manage
              </Link>
            </div>

            {computed.suggestions.length === 0 ? (
              <div className="ai-empty ai-empty--tight">
                <div className="ai-emptyTitle">You’re on track.</div>
                <div className="ai-emptySub">
                  Next best move: share your campaign to keep momentum.
                </div>

                <div className="ai-emptyCtaRow">
                  {computed.primaryCampaignId ? (
                    <Link className="btn btn-ghost" href={`/campaigns/${computed.primaryCampaignId}`}>
                      Get share link
                    </Link>
                  ) : (
                    <Link className="btn btn-ghost" href="/campaigns/my">
                      Manage campaigns
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashActionList">
                {computed.suggestions.slice(0, 2).map((s) => (
                  <div key={s.key} className="dashActionCard">
                    <div className="dashActionBody">
                      <div className="dashActionTitle">{s.title}</div>
                      <div className="dashActionText">{s.detail}</div>
                    </div>

                    <div className="dashActionFooter">
                      <Link className="btn btn-primary" href={s.ctaTo}>
                        {s.ctaLabel}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad stack dash-danger">
            <div className="section-head">
              <h2 className="h2">Danger zone</h2>
            </div>

            <p className="p dash-muted" style={{ marginTop: -6 }}>
              Permanently delete your nonprofit account. This cannot be undone.
            </p>

            {dangerErr ? <div className="alert alert-error">Error: {dangerErr}</div> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                title="Delete account"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>

              <span className="small dash-muted" style={{ alignSelf: "center" }}>
                Tip: use this to clean up test accounts before demo day.
              </span>
            </div>
          </div>

          <div className="card card-pad stack">
            <div className="section-head">
              <h2 className="h2">Your campaigns</h2>
              <Link className="btn btn-ghost" href="/campaigns/my">
                Manage
              </Link>
            </div>

            {loading ? (
              <p className="p">Loading your campaigns…</p>
            ) : myCampaigns.length === 0 ? (
              <p className="p">No campaigns yet.</p>
            ) : (
              <div className="dashCampaignList">
                {myCampaigns.slice(0, 3).map((c: any) => {
                  const goal = Number(c?.goalAmount || 0);
                  const raised = Number(c?.amountRaised || 0);
                  const pct = campaignPct(raised, goal);

                  return (
                    <article key={c?._id || c?.title} className="dashCampaignCard">
                      <div className="dashCampaignTop">
                        <div>
                          <div className="dashCampaignTitle">
                            {c?.title || "Untitled campaign"}
                          </div>

                          <div className="dashCampaignMeta">
                            <span>
                              <strong>Goal:</strong> ${formatMoney(goal)}
                            </span>
                            <span>
                              <strong>Raised:</strong> ${formatMoney(raised)}
                            </span>
                            <span>
                              <strong>Status:</strong> {c?.status || "active"}
                            </span>
                            <span>
                              <strong>{pct}%</strong> funded
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="dashCampaignProgressWrap">
                        <div className="progress" aria-label="Campaign progress">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="dashCampaignActions">
                        {c?._id ? (
                          <>
                            <Link className="btn btn-ghost" href={`/campaigns/${c._id}`}>
                              View
                            </Link>
                            <Link className="btn btn-outline" href={`/campaigns/${c._id}/edit`}>
                              Edit
                            </Link>
                          </>
                        ) : (
                          <div className="alert alert-error" style={{ margin: 0 }}>
                            Missing campaign ID (_id) from API response.
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}