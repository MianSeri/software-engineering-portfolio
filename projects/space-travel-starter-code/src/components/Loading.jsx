import styles from "./Loading.module.css";

export default function Loading({ label, message }) {
  const text = label ?? message ?? "Loading...";
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
      <div className={styles.text}>{text}</div>
    </div>
  );
}
