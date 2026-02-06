import { useEffect, useState } from "react";
import SpaceTravelApi from "../services/SpaceTravelApi";

import Loading from "../components/Loading";
import styles from "./PlanetsPage.module.css";



export default function PlanetsPage() {
  const [planets, setPlanets] = useState([]);
  const [spacecrafts, setSpacecrafts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // dispatch UI state
  const [selectedCraftId, setSelectedCraftId] = useState("");
  const [selectedTargetPlanetId, setSelectedTargetPlanetId] = useState("");
  const [dispatching, setDispatching] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const planetsRes = await SpaceTravelApi.getPlanets();
      const craftsRes = await SpaceTravelApi.getSpacecrafts();

      if (planetsRes.isError || craftsRes.isError) {
        setError("Failed to load planets or spacecrafts.");
      } else {
        setPlanets(planetsRes.data);
        setSpacecrafts(craftsRes.data);
      }
    } catch (err) {
      setError("Something went wrong while loading data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);


  async function dispatchIfReady(nextCraftId, nextPlanetId) {
    const craftId = nextCraftId ?? selectedCraftId;
    const planetId = nextPlanetId ?? selectedTargetPlanetId;
  
    // update UI selection highlights
    if (nextCraftId !== undefined) setSelectedCraftId(nextCraftId);
    if (nextPlanetId !== undefined) setSelectedTargetPlanetId(nextPlanetId);
  
    // only dispatch when BOTH are chosen
    if (!craftId || planetId === "") return;
  
    const craft = spacecrafts.find((c) => c.id === craftId);
    const targetIdNum = Number(planetId);
  
    // block sending spacecraft to the same planet
    if (craft && craft.currentLocation === targetIdNum) {
      alert("That spacecraft is already on this planet.");
      return;
    }
  
    setDispatching(true);
    const res = await SpaceTravelApi.sendSpacecraftToPlanet({
      spacecraftId: craftId,
      targetPlanetId: targetIdNum,
    });
    setDispatching(false);
  
    if (res.isError) {
      alert(res.data?.message || "Dispatch failed.");
      return;
    }
  
    await loadData();
  
    // allows a clear destination highlight
    setSelectedTargetPlanetId("");
  }
  

//   async function handleDispatch() {
//     if (!selectedCraftId) {
//       alert("Pick a spacecraft first.");
//       return;
//     }
//     if (selectedTargetPlanetId === "") {
//       alert("Pick a destination planet.");
//       return;
//     }

//     const targetIdNum = Number(selectedTargetPlanetId);

//     setDispatching(true);

//     const res = await SpaceTravelApi.sendSpacecraftToPlanet({
//       spacecraftId: selectedCraftId,
//       targetPlanetId: targetIdNum,
//     });

//     setDispatching(false);

//     if (res.isError) {
//       // The mock API throws an error if same planet
//       alert(res.data?.message || "Dispatch failed.");
//       return;
//     }

//     // Refresh so the UI updates (ship location + populations)
//     await loadData();

//     // reset destination (optional)
//     setSelectedTargetPlanetId("");
//   }

  if (loading) return <Loading message="Loading planets..." />;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Planets</h1>
  
      {planets.map((planet) => {
        const stationed = spacecrafts.filter((c) => c.currentLocation === planet.id);
        const isPlanetSelected = String(planet.id) === selectedTargetPlanetId;
  
        return (
          <div
            key={planet.id}
            className={`${styles.planetCard} ${isPlanetSelected ? styles.planetSelected : ""}`}
            onClick={() => dispatchIfReady(undefined, String(planet.id))}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.planetGrid}>
              <div className={styles.media}>
                {planet.pictureUrl ? (
                  <img src={planet.pictureUrl} alt={planet.name} />
                ) : (
                  <div style={{ height: 240, display: "grid", placeItems: "center" }}>
                    <span style={{ opacity: 0.7 }}>No image</span>
                  </div>
                )}
              </div>
  
              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <h2 className={styles.title}>{planet.name}</h2>
                  <p className={styles.population}>Population: {planet.currentPopulation}</p>
                </div>
  
                <div className={styles.sectionLabel}>Stationed Spacecraft</div>
  
                {stationed.length === 0 ? (
                  <p className={styles.empty}>No spacecraft stationed here.</p>
                ) : (
                  <ul className={styles.shipList}>
                    {stationed.map((c) => {
                      const isCraftSelected = c.id === selectedCraftId;
  
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            className={`${styles.shipBtn} ${isCraftSelected ? styles.shipBtnSelected : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatchIfReady(c.id, undefined);
                            }}
                          >
                            <span aria-hidden="true">🚀</span>
                            <span>
                              {c.name} <span style={{ opacity: 0.75 }}>(capacity {c.capacity})</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}  