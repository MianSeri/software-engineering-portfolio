import "./MissionAction.css";

function MissionAction({ missionId, currentStatus, onChangeStatus }) {
  const actions = [];

  // Example behavior from the video:
  // Planned → show: Launch
  // Active → show: Complete
  // Completed → show: (none)
  if (currentStatus === "Planned") {
    actions.push({ label: "Launch", next: "Active" });
  }

  if (currentStatus === "Active") {
    actions.push({ label: "Complete", next: "Completed" });
  }

  return (
    <div className="mission-action">
      {actions.map(act => (
        <button
          key={act.label}
          className="mission-action__simple-button"
          onClick={() => onChangeStatus(missionId, act.next)}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
}

export default MissionAction;


