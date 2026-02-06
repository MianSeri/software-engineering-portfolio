

function HealthDisplay({ label, value, className }) {
  return (
    <div className={className}>
      {label}: {value}
    </div>
  );
}

export default HealthDisplay;