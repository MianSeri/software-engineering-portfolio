"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { getCampaign, updateCampaign } from "@/lib/campaigns";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

function formatUSD(value: any) {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
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
      No image yet — still beautiful.
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function isHttpUrl(u: string) {
  const s = String(u || "").trim();
  if (!s) return false;
  if (s.startsWith("file://")) return false;
  return /^https?:\/\/.+/i.test(s) || s.startsWith("/uploads/");
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    status: "active",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    (async () => {
      if (!id) return;

      try {
        setLoading(true);
        setErr("");

        const data = await getCampaign(id);
        const c = (data as any)?.campaign ?? data;

        setForm({
          title: c?.title || "",
          description: c?.description || "",
          goalAmount: c?.goalAmount != null ? String(c.goalAmount) : "",
          status: c?.status || "active",
          imageUrl: c?.imageUrl || "",
        });

        setImagePreview("");
        setImageFile(null);
      } catch (e: any) {
        setErr(e?.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const titleCount = form.title.length;
  const descCount = form.description.length;
  const goalPretty = useMemo(() => formatUSD(form.goalAmount), [form.goalAmount]);

  const previewSrc = useMemo(() => {
    if (imagePreview) return imagePreview;

    const raw = (form.imageUrl || "").trim();
    if (raw) {
      const resolved = resolveImageUrl(raw);
      return resolved || raw;
    }

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
    if (!id) return;

    setErr("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append(
        "goalAmount",
        String(Number(String(form.goalAmount).replace(/[^\d.]/g, "")) || 0)
      );
      fd.append("status", form.status);

      // Required third option support:
      // send imageUrl in FormData even when clearing it
      fd.append("imageUrl", isHttpUrl(form.imageUrl) ? form.imageUrl.trim() : "");

      if (imageFile) {
        fd.append("image", imageFile);
      }

      await updateCampaign(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: Number(String(form.goalAmount).replace(/[^\d.]/g, "")) || 0,
        status: form.status,
        imageUrl: form.imageUrl,
        imageFile: imageFile || undefined,
      });
      router.replace("/campaigns/my");
    } catch (e2: any) {
      setErr(e2?.data?.error || e2?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="ec-page">
        <div className="ec-shell">
          <div className="ec-card">Loading…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="ec-page">
      <div className="ec-shell">
        <section className="ec-card">
          <header className="ec-header">
            <div>
              <p className="ec-kicker">Campaign Builder</p>
              <h1>Edit campaign</h1>
              <p className="ec-subtitle">Update details donors will see on your campaign page.</p>
            </div>

            <Link className="ec-back" href="/campaigns/my">
              ← Back
            </Link>
          </header>

          <div className="ec-topbar">
            <div className="ec-pillWrap">
              <span className={`ec-pill ec-pill--${form.status}`}>{form.status}</span>
              <span className="ec-mini">Changes save instantly to your public view (if Active).</span>
            </div>
          </div>

          {err ? <div className="ec-alert">{err}</div> : null}

          <form className="ec-form" onSubmit={onSubmit}>
            <div className="ec-field">
              <div className="ec-labelRow">
                <label htmlFor="title">Title</label>
                <span className="ec-count">{titleCount}/80</span>
              </div>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={80}
                placeholder="e.g., Food Bank Support"
                required
              />
            </div>

            <div className="ec-grid">
              <div className="ec-field">
                <label htmlFor="goalAmount">Goal amount (USD)</label>
                <input
                  id="goalAmount"
                  name="goalAmount"
                  value={form.goalAmount}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="5000"
                  required
                />
                <p className="ec-hint">
                  Preview: <span className="ec-mono">{goalPretty || "—"}</span>
                </p>
              </div>

              <div className="ec-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active (public)</option>
                  <option value="draft">Draft (private)</option>
                  <option value="paused">Paused</option>
                </select>
                <p className="ec-hint">Draft won’t show on public campaigns.</p>
              </div>
            </div>

            <div className="ec-field">
              <div className="ec-labelRow">
                <label htmlFor="description">Description</label>
                <span className="ec-count">{descCount}/500</span>
              </div>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                rows={6}
                placeholder="What will this campaign accomplish?"
                required
              />
            </div>

            <div className="ec-grid">
              <div className="ec-field">
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
                <p className="ec-hint">Use a direct jpg/png link. Best for deployed demo campaigns.</p>
              </div>

              <div className="ec-field">
                <label htmlFor="imageFile">Replace image (jpg/png)</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);

                    // If user uploads a file, clear the imageUrl field
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
                <p className="ec-hint">Uploading overrides the URL for this save.</p>
              </div>
            </div>

            <div className="ec-actions">
              <Link className="btn btn--ghost" href="/campaigns/my">
                Cancel
              </Link>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        <aside className="ec-previewCard" aria-label="Live preview">
          <div className="ec-miniHeader">
            <p className="ec-miniTitle">Live preview</p>
            <span className={`ec-pill ec-pill--${form.status}`}>{form.status}</span>
          </div>

          <div className="ec-miniMedia">
            <img
              src={previewSrc}
              alt="Preview"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = placeholderSvgDataUrl(
                  form.title || "Campaign"
                );
              }}
            />
          </div>

          <div className="ec-miniBody">
            <h3 className="ec-miniH">{form.title.trim() || "Campaign title"}</h3>
            <p className="ec-miniP">
              {form.description.trim() ||
                "Describe who this helps, what the funds will do, and why it matters."}
            </p>

            <div className="ec-miniStats">
              <div className="ec-stat">
                <p className="ec-statLabel">Goal</p>
                <p className="ec-statValue">{goalPretty || "$—"}</p>
              </div>
              <div className="ec-stat">
                <p className="ec-statLabel">Raised</p>
                <p className="ec-statValue">$0</p>
              </div>
            </div>

            <div className="ec-miniProgress">
              <div className="ec-miniBar">
                <div className="ec-miniFill" style={{ width: "0%" }} />
              </div>
              <p className="ec-miniNote">This is how donors will see your campaign card.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}