export function resolveImageUrl(raw?: string | null) {
    const url = (raw || "").trim();
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
    // If backend serves uploaded files (example: /uploads/xxx.jpg)
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
    if (url.startsWith("/")) return `${base}${url}`;
    return `${base}/${url}`;
  }