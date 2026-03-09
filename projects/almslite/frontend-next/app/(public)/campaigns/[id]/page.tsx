// donor campaign detail page

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCampaign, type Campaign } from "@/lib/campaigns";
import DonationForm from "@/components/DonationForm";

function money(n: any) {
  const num = Number(n || 0);
  return num.toLocaleString();
}

function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= breakpoint);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
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
      No image provided — your story still shows beautifully.
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function resolveImageUrlMaybe(raw: any) {
  if (!isUsableImageUrl(raw)) return null;
  const url = String(raw).trim();

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
  if (url.startsWith("/")) return `${apiBase}${url}`;

  return `${apiBase}/${url}`;
}

function getCampaignImgSrc(campaign: any) {
  const raw = campaign?.imageUrl;
  const resolved = resolveImageUrlMaybe(raw);
  return resolved || placeholderSvgDataUrl(campaign?.title);
}

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const isMobile = useIsMobile(760);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const progressPct = useMemo(() => {
    const goal = Number((campaign as any)?.goalAmount || 0);
    const raised = Number((campaign as any)?.amountRaised || 0);
    if (!goal) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  }, [campaign]);

  async function loadCampaign(
    campaignId: string | undefined,
    { showSpinner = true } = {}
  ) {
    if (!campaignId) {
      setCampaign(null);
      setLoading(false);
      setError("Missing campaign id in the URL.");
      return;
    }

    try {
      if (showSpinner) setLoading(true);
      setError("");

      const data = await getCampaign(campaignId);
      const c = (data as any)?.campaign ?? data;
      setCampaign((c as Campaign) || null);
    } catch (err: any) {
      setCampaign(null);
      setError(err?.message || "Failed to load campaign");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function reloadCampaign() {
    await loadCampaign(id, { showSpinner: false });
  }

  useEffect(() => {
    setCampaign(null);
    setError("");
    setLoading(true);
    loadCampaign(id, { showSpinner: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <p className="small" style={{ padding: 16 }}>
        Loading campaign…
      </p>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ padding: 16 }}>
          <Link className="btn btn-ghost cd-back" href="/campaigns">
            ← Back to campaigns
          </Link>
          <p className="alert alert-error" style={{ marginTop: 16 }}>
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page">
        <div className="container" style={{ padding: 16 }}>
          <Link className="btn btn-ghost cd-back" href="/campaigns">
            ← Back to campaigns
          </Link>
          <p className="small" style={{ marginTop: 16 }}>
            Campaign not found.
          </p>
        </div>
      </div>
    );
  }

  const raised = Number((campaign as any).amountRaised || 0);
  const goal = Number((campaign as any).goalAmount || 0);

  const imgSrc = getCampaignImgSrc(campaign);

  const donateForm = (campaign as any)?._id ? (
    <DonationForm campaignId={(campaign as any)._id} onSuccess={reloadCampaign} />
  ) : (
    <div className="alert alert-error" style={{ marginTop: 12 }}>
      Error: Campaign is missing an ID. Please refresh or check the API response shape.
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        {isMobile ? (
          <div className="cd-app">
            <div className="cd-phone">
              <div className="cd-phone-top">
                <Link className="cd-back-mini" href="/campaigns">
                  ← Back
                </Link>
                <div className="cd-notch" aria-hidden="true" />
              </div>

              <div className="cd-phone-hero">
                <img
                  src={imgSrc}
                  alt={(campaign as any).title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      placeholderSvgDataUrl((campaign as any).title);
                  }}
                />
                <div className="cd-heart" aria-hidden="true">
                  ♡
                </div>
              </div>

              <div className="cd-phone-body">
                <h1 className="cd-title">{(campaign as any).title}</h1>

                {(campaign as any).description && (
                  <p className="cd-sub">{(campaign as any).description}</p>
                )}

                <div className="cd-label">Total donation:</div>

                <div className="progress cd-progress" aria-label="Campaign progress">
                  <span style={{ width: `${progressPct}%` }} />
                </div>

                <div className="cd-phone-metrics">
                  <div>
                    <span className="cd-k2">Raised</span> <strong>${money(raised)}</strong>
                  </div>
                  <div>
                    <span className="cd-k2">Target</span> <strong>${money(goal)}</strong>
                  </div>
                  <div>
                    <strong>{progressPct}%</strong>
                  </div>
                </div>

                <div className="cd-phone-status">
                  <span className={`cd-status ${(campaign as any).status || "active"}`}>
                    {(campaign as any).status || "active"}
                  </span>
                  <span className="small">Every donation moves this mission forward.</span>
                </div>

                <div className="cd-section-title" id="donate">
                  Donate
                </div>

                {donateForm}
              </div>
            </div>
          </div>
        ) : (
          <div className="cd-web">
            <Link className="btn btn-ghost cd-back" href="/campaigns">
              ← Back to campaigns
            </Link>

            <div className="cd-grid">
              <section className="card cd-panel">
                <div className="cd-hero">
                  <img
                    src={imgSrc}
                    alt={(campaign as any).title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        placeholderSvgDataUrl((campaign as any).title);
                    }}
                  />
                  <span className={`cd-status ${(campaign as any).status || "active"}`}>
                    {(campaign as any).status || "active"}
                  </span>
                </div>

                <div className="cd-body">
                  <h1 className="cd-title">{(campaign as any).title}</h1>

                  {(campaign as any).description && (
                    <p className="cd-sub">{(campaign as any).description}</p>
                  )}

                  <div className="cd-metrics">
                    <div className="cd-metric">
                      <div className="cd-k">Raised</div>
                      <div className="cd-v">${money(raised)}</div>
                    </div>
                    <div className="cd-metric">
                      <div className="cd-k">Target</div>
                      <div className="cd-v">${money(goal)}</div>
                    </div>
                    <div className="cd-metric cd-pct">
                      <div className="cd-k">Funded</div>
                      <div className="cd-v">{progressPct}%</div>
                    </div>
                  </div>

                  <div className="progress cd-progress" aria-label="Campaign progress">
                    <span style={{ width: `${progressPct}%` }} />
                  </div>

                  <div className="cd-note">
                    <span className="badge-give">Impact</span>
                    <span className="small">Every donation moves this mission forward.</span>
                  </div>
                </div>
              </section>

              <aside id="donate" className="card cd-panel cd-donate">
                <div className="cd-donate-head">
                  <h2 className="h2">Donate</h2>
                  <p className="p">Fast, secure, and transparent.</p>
                </div>

                {donateForm}
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}