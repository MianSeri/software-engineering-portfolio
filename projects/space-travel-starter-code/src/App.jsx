// App.jsx
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import styles from "./App.module.css";

import HomePage from "./pages/HomePage";
import SpacecraftsPage from "./pages/SpacecraftsPage";
import PlanetsPage from "./pages/PlanetsPage";
import SpacecraftPage from "./pages/SpacecraftPage";
import BuildSpacecraftPage from "./pages/BuildSpacecraftPage";

export default function App() {
  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
            end
          >
            🌍 Home
          </NavLink>

          <NavLink
            to="/spacecrafts"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            🚀 Spacecrafts
          </NavLink>

          <NavLink
            to="/planets"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            🪐 Planets
          </NavLink>
        </nav>

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/spacecrafts" element={<SpacecraftsPage />} />
            <Route path="/spacecrafts/build" element={<BuildSpacecraftPage />} />
            <Route path="/spacecrafts/:id" element={<SpacecraftPage />} />
            <Route path="/planets" element={<PlanetsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
