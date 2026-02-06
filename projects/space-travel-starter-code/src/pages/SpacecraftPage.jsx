import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import Loading from "../components/Loading";
import styles from "./SpacecraftPage.module.css";

export default function SpacecraftPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spacecraft, setSpacecraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const res = await SpaceTravelApi.getSpacecraftById({ id });

        if (res.isError) throw res.data;
        if (isMounted) setSpacecraft(res.data);
      } catch (err) {
        if (isMounted) setErrorMsg(err?.message || "Failed to load spacecraft.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleDecommission() {
    try {
      const res = await SpaceTravelApi.destroySpacecraftById({ id });
      if (res.isError) throw res.data;
      navigate("/spacecrafts");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to decommission spacecraft.");
    }
  }

  // NOTE: your Loading component might want "message" not "label"
  if (isLoading) return <Loading message="Loading spacecraft..." />;

  if (errorMsg) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{errorMsg}</p>
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <Link className={styles.link} to="/spacecrafts">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  if (!spacecraft) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Spacecraft not found.</p>
        <Link className={styles.link} to="/spacecrafts">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{spacecraft.name}</h1>
          <p className={styles.capacity}>Capacity: {spacecraft.capacity}</p>
        </div>

        {spacecraft.pictureUrl ? (
          <img
            src={spacecraft.pictureUrl}
            alt={spacecraft.name}
            className={styles.image}
          />
        ) : (
          <p className={styles.muted}>No image available.</p>
        )}

        <p className={styles.description}>{spacecraft.description}</p>

        <div className={styles.actions}>
          <button className={styles.dangerBtn} onClick={handleDecommission}>
            Decommission
          </button>
        </div>
      </div>
    </div>
  );
}
