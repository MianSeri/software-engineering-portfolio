import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceTravelApi from "../services/SpaceTravelApi";
import styles from "./BuildSpacecraftPage.module.css";

export default function BuildSpacecraftPage() {
  const navigate = useNavigate();

  // Form state (what the user types)
  const [form, setForm] = useState({
    name: "",
    capacity: "",
    description: "",
    pictureUrl: "",
  });
  
  // Error messages (what we show if something is missing)
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(evt) {
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";

    if (!form.capacity) {
      nextErrors.capacity = "Capacity is required.";
    } else if (Number.isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) {
      nextErrors.capacity = "Capacity must be a positive number.";
    }

    return nextErrors;
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    // If we have any errors, stop here
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

// added this when i wanted to place a default image
    // const newCraft = {
    //     name: form.name.trim(),
    //     capacity: Number(form.capacity),
    //     description: form.description.trim(),
    //     pictureUrl: form.pictureUrl.trim() || "https://picsum.photos/300/300",
    //   };

    //   const res = await SpaceTravelApi.buildSpacecraft(newCraft);

    //   setSubmitting(false);
    
    //   if (res.isError) {
    //     alert("Could not build spacecraft.");
    //     return;
    //   }

    const res = await SpaceTravelApi.buildSpacecraft({
      name: form.name.trim(),
      capacity: Number(form.capacity),
      description: form.description.trim(),
      // mock API expects pictureUrl; we’ll pass null/undefined if empty
      pictureUrl: form.pictureUrl.trim() ? form.pictureUrl.trim() : undefined,
    });

    setSubmitting(false);

    if (res.isError) {
      alert("Could not build spacecraft.");
      return;
    }

    // After building, go back to spacecraft list
    navigate("/spacecrafts");
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
  
      <div className={styles.card}>
        <h1 className={styles.title}>Build New Spacecraft</h1>
        <p className={styles.subtitle}>
          Create a new ship and it will appear in your Spacecraft list (and can be dispatched to planets).
        </p>
  
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>
  
          <div className={styles.field}>
            <label htmlFor="capacity">Capacity *</label>
            <input
              id="capacity"
              className={styles.input}
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 500"
            />
            {errors.capacity && <p className={styles.error}>{errors.capacity}</p>}
          </div>
  
          <div className={styles.field}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
            />
            {errors.description && <p className={styles.error}>{errors.description}</p>}
          </div>
  
          <div className={styles.field}>
            <label htmlFor="pictureUrl">Picture URL (optional)</label>
            <input
              id="pictureUrl"
              className={styles.input}
              name="pictureUrl"
              value={form.pictureUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
            <p className={styles.hint}>
              Leave blank to use a default image.
            </p>
          </div>
  
          <div className={styles.actions}>
            <button className={styles.primaryBtn} type="submit" disabled={submitting}>
              {submitting ? "Building..." : "Build Spacecraft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}  