import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Space Travel</h1>

          <p className={styles.heroSubtitle}>
            Welcome, Commander. Your mission is to relocate humanity by building spacecraft,
            managing fleets, and dispatching ships to new worlds.
          </p>

          <div className={styles.ctaRow}>
            <Link className={styles.primary} to="/spacecrafts">
              View Spacecrafts
            </Link>
            <Link className={styles.secondary} to="/planets">
              View Planets
            </Link>
          </div>
        </div>
      </header>

      {/* FEATURE CARDS */}
      <section className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Spacecrafts</h2>
          <p className={styles.cardText}>
            View all spacecraft, inspect details, build new ships, and decommission old ones.
          </p>

          <ul className={styles.featureList}>
            <li>See capacity + description</li>
            <li>Open a spacecraft detail page</li>
            <li>Create a new spacecraft on Earth</li>
          </ul>

          <Link className={styles.cardLink} to="/spacecrafts">
            Go to Spacecrafts →
          </Link>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Planets</h2>
          <p className={styles.cardText}>
            Monitor planetary populations and see which spacecraft are stationed on each planet.
          </p>

          <ul className={styles.featureList}>
            <li>List planets + images</li>
            <li>See stationed ships per planet</li>
            <li>Dispatch spacecraft to another planet</li>
          </ul>

          <Link className={styles.cardLink} to="/planets">
            Go to Planets →
          </Link>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Local “API” Data</h2>
          <p className={styles.cardText}>
            This project uses a mock API that saves data in your browser’s localStorage.
            Your spacecraft and population changes persist when you refresh.
          </p>

          <p className={styles.tip}>
            Tip: If you want a fresh start, clear localStorage in DevTools → Application.
          </p>
        </div>
      </section>
    </div>
  );
}

