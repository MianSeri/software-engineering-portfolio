import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import Loading from "../components/Loading";
import styles from "./SpacecraftsPage.module.css";

export default function SpacecraftsPage() {
  const [spacecrafts, setSpacecrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSpacecrafts() {
    setLoading(true);
    setError("");

    try {
      const response = await SpaceTravelApi.getSpacecrafts();
      if (response.isError) setError("Failed to load spacecrafts.");
      else setSpacecrafts(response.data);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpacecrafts();
  }, []);

  async function handleDestroy(id) {
    const ok = window.confirm("Are you sure you want to decommission this spacecraft?");
    if (!ok) return;

    const response = await SpaceTravelApi.destroySpacecraftById({ id });
    if (response.isError) return alert("Could not destroy spacecraft.");

    loadSpacecrafts();
  }

  if (loading) return <Loading message="Loading spacecraft..." />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.h1}>Spacecrafts</h1>
          <p className={styles.sub}>Inspect details, build new ships, and decommission old ones.</p>
        </div>

        <Link className={styles.primaryBtn} to="/spacecrafts/build">
          ➕ Build Spacecraft
        </Link>
      </div>

      <div className={styles.grid}>
        {spacecrafts.map((craft) => (
          <div key={craft.id} className={styles.card}>
            <div className={styles.row}>
              <div className={styles.thumb}>
                {craft.pictureUrl ? (
                  <img src={craft.pictureUrl} alt={craft.name} />
                ) : (
                  <span aria-hidden>🚀</span>
                )}
              </div>

              <div className={styles.meta}>
                <h3 className={styles.name}>{craft.name}</h3>
                <p className={styles.capacity}>Capacity: {craft.capacity}</p>
                <p className={styles.desc}>{craft.description}</p>

                <div className={styles.actions}>
                  <Link className={styles.link} to={`/spacecrafts/${craft.id}`}>
                    View →
                  </Link>

                  <button className={styles.dangerBtn} onClick={() => handleDestroy(craft.id)}>
                    Decommission
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
