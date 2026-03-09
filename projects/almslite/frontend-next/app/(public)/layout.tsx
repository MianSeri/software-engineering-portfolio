// app/(public)/layout.tsx
import "./public.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="publicPage">{children}</div>;
}