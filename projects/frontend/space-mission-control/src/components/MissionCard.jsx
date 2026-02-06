import "./MissionCard.css";

function MissionCard({ name, status, crew }) {
  return (
    <div className="mission-card">
      <div className="mission-card__header">
        <h2 className="mission-card__title">{name}</h2>
        <span className={`mission-card__badge mission-card__badge--${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <p className="mission-card__line">
        <strong>Status:</strong> {status}
      </p>
      <p className="mission-card__line">
        <strong>Crew:</strong> {crew.join(", ")}
      </p>
    </div>
  );
}

export default MissionCard;

