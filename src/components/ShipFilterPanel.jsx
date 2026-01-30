import React from "react";
import "../styles/shipsearch.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ShipFilterPanel({ filters, onChange, ports, types, onClear }) {
  const toggleType = (t) => {
    const next = filters.types ? [...filters.types] : [];
    if (next.includes(t)) {
      onChange({ ...filters, types: next.filter((x) => x !== t) });
    } else {
      onChange({ ...filters, types: [...next, t] });
    }
  };

  return (
    <aside className="ship-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="clear-btn" onClick={onClear}>Clear</button>
      </div>

      <label>Start Port</label>
      <select value={filters.startPort} onChange={(e) => onChange({ ...filters, startPort: e.target.value })}>
        <option value="">Any</option>
        {ports.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <label>End Port</label>
      <select value={filters.endPort} onChange={(e) => onChange({ ...filters, endPort: e.target.value })}>
        <option value="">Any</option>
        {ports.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <div className="row">
        <div>
          <label>Max Distance (km)</label>
          <input type="number" value={filters.maxDistance ?? ""} onChange={(e) => onChange({ ...filters, maxDistance: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 4000" />
        </div>
        <div>
          <label>Min Capacity (t)</label>
          <input type="number" value={filters.minCapacity ?? ""} onChange={(e) => onChange({ ...filters, minCapacity: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 10000" />
        </div>
      </div>

      <label>Ship Types</label>
      <div className="types-grid">
        {types.map((t) => (
          <label key={t} className={`type-chip ${filters.types && filters.types.includes(t) ? 'active' : ''}`}>
            <input type="checkbox" checked={filters.types && filters.types.includes(t)} onChange={() => toggleType(t)} />
            {t}
          </label>
        ))}
      </div>

      <label>Available After</label>
      <DatePicker
        selected={
          filters.availableAfter
            ? new Date(filters.availableAfter)
            : null
        }
        onChange={(date) =>
          onChange({
            ...filters,
            availableAfter: date
              ? date.toISOString().slice(0, 10) // yyyy-mm-dd
              : null,
          })
        }
        dateFormat="yyyy-MM-dd"
        placeholderText="yyyy-mm-dd"
        className="date-picker-input"
      />

    </aside>
  );
}
