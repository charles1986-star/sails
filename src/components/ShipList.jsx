import React from "react";
import ShipCard from "./ShipCard";

export default function ShipList({ ships, onView, onApply }) {
  if (!ships.length) return <div className="no-results">No ships match your filters.</div>;

  return (
    <div className="ship-list">
      {ships.map((s) => (
        <ShipCard key={s.id} ship={s} onView={onView} onApply={onApply} />
      ))}
    </div>
  );
}
