"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CreateCampaign.module.css";

import { createCampaign } from "@/lib/campaigns";
import { getStoredToken } from "@/lib/auth";

function formatUSD(value: any) {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function isHttpUrl(u: any) {
  const s = String(u || "").trim();
  if (!s) return false;
  if (s.startsWith("file://")) return false;
  return /^https?:\/\/.+/i.test(s) || s.startsWith("/uploads/");
}

function placeholderSvgDataUrl(title = "Campaign") {
  const safe = String(title).slice(0, 44).replace(/&/g, "and").replace(/</g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e8f7f5"/>
        <stop offset="50%" stop-color="#eef9f8"/>
        <stop offset="100%" stop-color="#fff1f4"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2DB6A3"/>
        <stop offset="100%" stop-color="#0F5E55"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="240" cy="170" r="150" fill="#2DB6A3" opacity="0.14"/>
    <circle cx="980" cy="240" r="220" fill="#C73B59" opacity="0.10"/>
    <rect x="70" y="420" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.95"/>
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

export default function CreateCampaignPage() {
  const router = useRouter();

  const [checkedAuth, setCheckedAuth] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/nonprofit/login");
      return;
    }

    setCheckedAuth(true);
  }, [router]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const titleCount = form.title.length;
  const descCount = form.description.length;

  const goalPretty = useMemo(() => formatUSD(form.goalAmount), [form.goalAmount]);

  const impactLine = useMemo(() => {
    const goalNum = Number(String(form.goalAmount).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(goalNum) || goalNum <= 0) return "Set a goal to define your impact.";
    if (goalNum < 500) return "A focused micro-goal can move fast.";
    if (goalNum < 5000) return "A strong goal for a clear community outcome.";
    return "A major goal — perfect for a full campaign story.";
  }, [form.goalAmount]);

  const statusColor = useMemo(() => {
    if (form.status === "active") return "rgba(15,118,110,1)";
    if (form.status === "draft") return "rgba(100,116,139,1)";
    if (form.status === "paused") return "rgba(245,158,11,1)";
    return "rgba(15,118,110,1)";
  }, [form.status]);

  const previewSrc = useMemo(() => {
    if (imagePreview) return imagePreview;

    const raw = (form.imageUrl || "").trim();
    if (raw && isHttpUrl(raw)) return raw;

    return placeholderSvgDataUrl(form.title || "Campaign");
  }, [imagePreview, form.imageUrl, form.title]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload: {
        title: string;
        description: string;
        goalAmount: number;
        status: string;
        imageUrl?: string;
        imageFile?: File;
      } = {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: Number(String(form.goalAmount).replace(/[^\d.]/g, "")) || 0,
        status: form.status,
      };

      if (imageFile) {
        payload.imageFile = imageFile;
      }

      if (isHttpUrl(form.imageUrl)) {
        payload.imageUrl = form.imageUrl.trim();
      }

      await createCampaign(payload);
      router.replace("/campaigns/my");
    } catch (e2: unknown) {
      if (e2 instanceof Error) {
        setErr(e2.message);
      } else {
        setErr("Failed to create campaign");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!checkedAuth) return null;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Campaign Builder</p>
              <h1 className={styles.h1}>Create a campaign</h1>
              <p className={styles.sub}>
                Turn a need into a clear story donors can trust — and support in minutes.
              </p>
            </div>

            <Link className={styles.back} href="/dashboard">
              ← Back to dashboard
            </Link>
          </header>

          <div className={styles.steps} aria-label="Campaign setup steps">
            <div className={`${styles.step} ${styles.stepActive}`}>
              <span className={styles.stepDot} />
              <span>Details</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepDot} />
              <span>Funding</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepDot} />
              <span>Finish</span>
            </div>
          </div>

          <div className={styles.impact}>
            <div>
              <p className={styles.impactLabel}>Impact</p>
              <p className={styles.impactText}>{impactLine}</p>
            </div>
            <div className={styles.impactRight}>
              <p className={styles.impactGoal}>{goalPretty || "$—"}</p>
              <p className={styles.impactHint}>Goal preview</p>
            </div>
          </div>

          {err ? <div className={styles.alert}>{err}</div> : null}

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="title">Title</label>
                <span className={styles.count}>{titleCount}/80</span>
              </div>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={80}
                placeholder="e.g., School supplies for 200 students"
                required
              />
              <p className={styles.hint}>Make it specific and outcome-focused.</p>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="description">Description</label>
                <span className={styles.count}>{descCount}/500</span>
              </div>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                rows={6}
                placeholder="What is this campaign raising funds for? Who will it help?"
                required
              />
              <p className={styles.hint}>Add who, what, where, and why it matters.</p>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="goalAmount">Goal amount (USD)</label>
                <input
                  id="goalAmount"
                  name="goalAmount"
                  value={form.goalAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  inputMode="numeric"
                  required
                />
                <p className={styles.hint}>
                  Preview: <span className={styles.mono}>{goalPretty || "—"}</span>
                </p>
              </div>

              <div className={styles.field}>
                <label htmlFor="status">Status</label>
                <div
                  className={styles.selectWrap}
                  style={{ "--statusColor": statusColor } as React.CSSProperties}
                >
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="active">Active (public)</option>
                    <option value="draft">Draft (private)</option>
                    <option value="paused">Paused</option>
                  </select>
                  <span className={styles.selectChevron} aria-hidden="true" />
                </div>
                <p className={styles.hint}>Draft won’t show on public campaigns.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg or /uploads/..."
                  disabled={!!imageFile}
                />
                <p className={styles.hint}>Use a full image URL or leave the existing /uploads/ path. Uploading a new image overrides this value.
                </p>
              </div>

              <div className={styles.field}>
                <label htmlFor="imageFile">Upload image (jpg/png)</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;

                    setImageFile(file);

                    // If user uploads a file, clear imageUrl
                    if (file) {
                      setForm((f) => ({
                        ...f,
                        imageUrl: "",
                      }));
                    }

                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview);
                    }

                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImagePreview("");
                    }
                  }}
                />
                <p className={styles.hint}>
                  Upload a flyer/cover image. If none, we’ll show a placeholder.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link className={`${styles.btn} ${styles.btnGhost}`} href="/dashboard">
                Cancel
              </Link>

              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create campaign"}
              </button>
            </div>
          </form>
        </section>

        <aside className={styles.previewCard} aria-label="Live preview">
          <div className={styles.previewHead}>
            <p className={styles.previewTitle}>Live preview</p>
            <span className={`${styles.pill} ${styles["pill-" + form.status]}`}>
              {form.status}
            </span>
          </div>

          <div className={styles.previewMedia}>
            <img
              src={previewSrc}
              alt="Campaign preview"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = placeholderSvgDataUrl(form.title || "Campaign");
              }}
            />
          </div>

          <div className={styles.previewBody}>
            <h3 className={styles.previewH}>
              {form.title.trim() || "Your campaign title will appear here"}
            </h3>

            <p className={styles.previewP}>
              {form.description.trim() ||
                "Describe who this helps, what the funds will do, and why it matters."}
            </p>

            <div className={styles.previewStats}>
              <div className={styles.stat}>
                <p className={styles.statLabel}>Goal</p>
                <p className={styles.statValue}>{goalPretty || "$—"}</p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>Raised</p>
                <p className={styles.statValue}>$0</p>
              </div>
            </div>

            <div className={styles.previewProgress}>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: "0%" }} />
              </div>
              <p className={styles.note}>This is what donors will see on your campaign page.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}