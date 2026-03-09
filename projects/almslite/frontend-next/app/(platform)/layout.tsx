// app/(platform)/layout.tsx
import "./platform.css";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <div className="platformShell">{children}</div>;
}