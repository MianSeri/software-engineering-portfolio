import { useState } from "react";
import "./MissionControl.css";

import MissionCard from "./MissionCard";
import MissionAction from "./MissionAction";
import MissionFilter from "./MissionFilter";

function MissionControl({ missions }) {
  const [missionList, setMissionList] = useState(missions);
  const [filter, setFilter] = useState("All");

  function handleStatusChange(id, newStatus) {
    console.log("Changing status for id:", id, "to", newStatus);
    setMissionList(oldList =>
      oldList.map(mission =>
        mission.id === id ? { ...mission, status: newStatus } : mission
      )
    );
  }

  const visibleMissions = missionList.filter(mission => {
    if (filter === "All") return true;
    return mission.status === filter;
  });

  return (
    <div className="mission-control">
      <h1 className="mission-control__title">Space Mission Control</h1>

      <MissionFilter currentFilter={filter} onChangeFilter={setFilter} />

      <div className="mission-control__list">
        {visibleMissions.map(mission => (
          <div key={mission.id} className="mission-control__item">
            <MissionCard
              name={mission.name}
              status={mission.status}
              crew={mission.crew}
            />
            <MissionAction
              missionId={mission.id}
              currentStatus={mission.status}
              onChangeStatus={handleStatusChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MissionControl;
