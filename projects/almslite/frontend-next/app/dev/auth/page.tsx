import { notFound } from "next/navigation";

export default function DevAuthPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <main style={{ padding: 24 }}>
      <h1>Dev Auth</h1>
      <p>Only available in development.</p>
    </main>
  );
}