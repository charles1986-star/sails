import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShipFilterPanel from "../components/ShipFilterPanel";
import ShipList from "../components/ShipList";
import shipsData from "../data/ships";
import "../styles/shipsearch.css";

export default function ShipSearch() {
  const [filters, setFilters] = useState({ startPort: "", endPort: "", maxDistance: null, types: [], availableAfter: null, minCapacity: null });
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const ports = useMemo(() => Array.from(new Set(shipsData.flatMap((s) => [s.startPort, s.endPort]))), []);
  const typesList = useMemo(() => Array.from(new Set(shipsData.map((s) => s.type))), []);

  const filtered = useMemo(() => {
    let out = shipsData.filter((s) => {
      if (filters.startPort && s.startPort !== filters.startPort) return false;
      if (filters.endPort && s.endPort !== filters.endPort) return false;
      if (filters.maxDistance && s.distance > filters.maxDistance) return false;
      if (filters.types && filters.types.length && !filters.types.includes(s.type)) return false;
      if (filters.availableAfter && new Date(s.availabilityDate) < new Date(filters.availableAfter)) return false;
      if (filters.minCapacity && s.capacityTons < filters.minCapacity) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const hay = `${s.name} ${s.type} ${s.startPort} ${s.endPort} ${s.ownerCompany}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "distance") out = out.slice().sort((a, b) => a.distance - b.distance);
    if (sortBy === "newest") out = out.slice().sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    return out;
  }, [filters, searchText, sortBy]);

  const navigate = useNavigate();

  const handleApply = (ship) => {
    navigate(`/ships/${ship.id}/apply`);
  };

  const handleView = (ship) => {
    navigate(`/ships/${ship.id}`);
  };

  const clearFilter = (key) => {
    if (key === "searchText") return setSearchText("");
    if (key === "all") return setFilters({ startPort: "", endPort: "", maxDistance: null, types: [], availableAfter: null, minCapacity: null });
    setFilters((prev) => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : "" }));
  };

  return (
    <div className="ship-search-page">
      <div className="container">
        <ShipFilterPanel filters={filters} onChange={setFilters} ports={ports} types={typesList} onClear={() => clearFilter("all")} />

        <main className="ship-feed">
          <div className="feed-top">
            <div className="search-input">
              <input placeholder="Search ships, ports, company..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>

            <div className="feed-controls">
              <div className="results-count">{filtered.length} ships</div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="distance">Shortest Distance</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="active-filters">
            {searchText && (
              <button className="chip" onClick={() => clearFilter("searchText")}>Search: {searchText} ×</button>
            )}
            {filters.startPort && <button className="chip" onClick={() => setFilters({ ...filters, startPort: "" })}>From: {filters.startPort} ×</button>}
            {filters.endPort && <button className="chip" onClick={() => setFilters({ ...filters, endPort: "" })}>To: {filters.endPort} ×</button>}
            {filters.types && filters.types.map((t) => <button key={t} className="chip" onClick={() => setFilters({ ...filters, types: filters.types.filter(x => x !== t) })}>{t} ×</button>)}
            {(filters.maxDistance || filters.minCapacity || filters.availableAfter) && (
              <button className="chip" onClick={() => clearFilter("all")}>Clear advanced filters</button>
            )}
          </div>

          <ShipList ships={filtered} onView={handleView} onApply={handleApply} />
        </main>
      </div>
    </div>
  );
}
