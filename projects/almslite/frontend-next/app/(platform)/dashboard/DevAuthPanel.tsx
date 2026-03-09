"use client";

import { useState } from "react";
import { storeToken, clearToken, getStoredToken } from "@/lib/auth";

export default function DevAuthPanel() {
  const [value, setValue] = useState("");

  const hasToken = Boolean(getStoredToken());
  const canSave = value.trim().length > 0;

  function onSave() {
    const token = value.trim();
    if (!token) return;
    storeToken(token);
    location.reload(); // refresh so hooks/components re-read token
  }

  function onClear() {
    clearToken();
    location.reload();
  }

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Dev Auth</div>

      <div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>
        Current token: {hasToken ? "set" : "missing"}
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste JWT token here"
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          style={{ padding: "8px 12px", opacity: canSave ? 1 : 0.6 }}
        >
          Save token
        </button>

        <button type="button" onClick={onClear} style={{ padding: "8px 12px" }}>
          Clear token
        </button>
      </div>
    </div>
  );
}