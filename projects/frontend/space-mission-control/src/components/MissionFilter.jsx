import "./MissionFilter.css";

function MissionFilter({ currentFilter, onChangeFilter }) {
  const filters = ["All", "Planned", "Active", "Completed"];

  return (
    <div className="mission-filter">
      {filters.map(filter => {
        const variantClass = `mission-filter__button--${filter.toLowerCase()}`;
        const isActive = currentFilter === filter;

        return (
          <button
            key={filter}
            className={[
              "mission-filter__button",
              variantClass,
              isActive ? "mission-filter__button--selected" : ""
            ].join(" ").trim()}
            onClick={() => onChangeFilter(filter)}
          >
            {filter.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default MissionFilter;
