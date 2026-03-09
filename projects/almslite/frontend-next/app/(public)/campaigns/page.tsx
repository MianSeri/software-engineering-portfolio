// public campaign page

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCampaigns, type Campaign } from "@/lib/campaigns";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

function money(n: any) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function percentFunded(raised: any, goal: any) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return Math.min(100, Math.round((r / g) * 100));
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
  const safe = String(title)
    .slice(0, 44)
    .replace(/&/g, "and")
    .replace(/</g, "");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="52%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#ffe4e6"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5a4"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="220" cy="170" r="150" fill="#0ea5a4" opacity="0.12"/>
    <circle cx="980" cy="240" r="220" fill="#fb7185" opacity="0.10"/>
    <rect x="70" y="420" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.92"/>
    <text x="92" y="457" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="white" font-weight="700">
      Alms
    </text>
    <text x="70" y="335" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="54" fill="#0f172a" font-weight="800">
      ${safe}
    </text>
    <text x="70" y="380" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="24" fill="#475569">
      No image yet — still looks great.
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getImgSrc(c: any) {
  const raw = c?.imageUrl;
  if (!isUsableImageUrl(raw)) {
    return placeholderSvgDataUrl(c?.title || "Campaign");
  }
  const resolved = resolveImageUrl(raw);
  return resolved || placeholderSvgDataUrl(c?.title || "Campaign");
}

function statusLabel(status: any) {
  const s = String(status || "active").toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "paused") return "Paused";
  return "Active";
}

export default function PublicCampaignsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await getCampaigns();
      const list = Array.isArray(data) ? data : (data as any)?.campaigns ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load campaigns");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const headerCtaHref = useMemo(() => {
    return hasToken ? "/dashboard" : "/nonprofit/login";
  }, [hasToken]);

  return (
    <div className="page">
      <div className="container">
        <div className="card card-pad">
          <div className="cpg-header">
            <div className="cpg-headerLeft">
              <div>
                <Link href="/" className="cpg-backBtn">
                  ← Back
                </Link>

                <div className="cpg-headlineRow">
                  <h1 className="h1 cpg-h1">Campaigns</h1>
                  <span className="cpg-modeBadge" title="Public donor view">
                    Public
                  </span>
                </div>

                <p className="p cpg-sub">
                  Explore causes and donate with confidence.
                </p>

                <div className="cpg-modeRow">
                  <Link className="cpg-modeLink" href={headerCtaHref}>
                    {hasToken ? "Go to dashboard →" : "Nonprofit login →"}
                  </Link>
                </div>
              </div>
            </div>

            <div className="cpg-headerRight">
              <button className="btn btn-primary" onClick={load} type="button">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {err ? (
          <div style={{ marginTop: 12 }}>
            <div className="alert alert-error">Error: {err}</div>
            <button
              className="btn btn-ghost"
              onClick={load}
              style={{ marginTop: 12 }}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="p" style={{ padding: 16 }}>
            Loading campaigns…
          </p>
        ) : items.length === 0 ? (
          <div className="card card-pad" style={{ marginTop: 12 }}>
            <p className="p" style={{ margin: 0 }}>
              No campaigns yet.
            </p>
          </div>
        ) : (
          <div className="cpg-list">
            {items.map((c: any) => {
              const id = c?._id;
              const goal = Number(c?.goalAmount || 0);
              const raised = Number(c?.amountRaised || 0);
              const pct = percentFunded(raised, goal);
              const badge = statusLabel(c?.status);

              return (
                <article
                  key={id || c?.title}
                  className="card cpg-card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    cursor: id ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (id) router.push(`/campaigns/${id}`);
                  }}
                  onKeyDown={(e) => {
                    if (!id) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/campaigns/${id}`);
                    }
                  }}
                  tabIndex={id ? 0 : -1}
                  role={id ? "link" : undefined}
                >
                  <div className="cpg-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImgSrc(c)}
                      alt={c?.title || "Campaign"}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          placeholderSvgDataUrl(c?.title || "Campaign");
                      }}
                    />
                    <span
                      className={`cpg-status ${String(
                        c?.status || "active"
                      ).toLowerCase()}`}
                    >
                      {badge}
                    </span>
                  </div>

                  <div className="cpg-body">
                    <div className="cpg-title">
                      {c?.title || "Untitled campaign"}
                    </div>

                    {c?.description ? (
                      <div className="cpg-desc">{c.description}</div>
                    ) : null}

                    <div className="cpg-progressWrap">
                      <div className="progress" aria-label="Campaign progress">
                        <span style={{ width: `${pct}%` }} />
                      </div>

                      <div className="cpg-metrics small">
                        <span>
                          <strong>Raised:</strong> ${money(raised)}
                        </span>
                        <span>
                          <strong>Goal:</strong> ${money(goal)}
                        </span>
                        <span>
                          <strong>{pct}%</strong> funded
                        </span>
                      </div>
                    </div>

                    <div className="cpg-actions">
                      {id ? (
                        <Link
                          href={`/campaigns/${id}#donate`}
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          aria-label={`Donate to ${c?.title || "campaign"}`}
                        >
                          View & Donate
                        </Link>
                      ) : (
                        <span
                          className="btn btn-primary"
                          style={{ pointerEvents: "none", opacity: 0.7 }}
                        >
                          View & Donate
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}