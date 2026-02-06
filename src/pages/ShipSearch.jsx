import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShipFilterPanel from "../components/ShipFilterPanel";
import ShipList from "../components/ShipList";
import Pagination from "../components/Pagination";
import shipsData from "../data/ships";
import { setShips } from "../redux/slices/shipSlice";
import axios from "axios";
import "../styles/shipsearch.css";

const API_URL = "http://localhost:5000/api/admin";

export default function ShipSearch() {
  const [filters, setFilters] = useState({ startPort: "", endPort: "", maxDistance: null, types: [], availableAfter: null, minCapacity: null });
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const dispatch = useDispatch();
  const shipsFromStore = useSelector((state) => state.ships.ships);

  useEffect(() => {
    // Load ships from API; if fails, fall back to bundled data
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/ships`);
        if (res?.data?.data) {
          dispatch(setShips(res.data.data));
        }
      } catch (err) {
        console.error("Failed to load ships from API:", err);
        // keep local shipsData as fallback
        if (!shipsFromStore || shipsFromStore.length === 0) {
          dispatch(setShips(shipsData));
        }
      }
    };
    
    if (!shipsFromStore || shipsFromStore.length === 0) {
      load();
    }
  }, [dispatch, shipsFromStore]);

  const sourceShips = (shipsFromStore && shipsFromStore.length) ? shipsFromStore : shipsData;

  // Get unique ports and types - handle both API and local data formats
  const ports = useMemo(() => {
    const portSet = new Set();
    sourceShips.forEach((s) => {
      if (s.current_port) portSet.add(s.current_port);
      if (s.next_port) portSet.add(s.next_port);
      if (s.startPort) portSet.add(s.startPort);
      if (s.endPort) portSet.add(s.endPort);
    });
    return Array.from(portSet);
  }, [sourceShips]);

  const typesList = useMemo(() => Array.from(new Set(sourceShips.map((s) => s.type))), [sourceShips]);

  const filtered = useMemo(() => {
    let out = sourceShips.filter((s) => {
      // Handle both API and local data formats
      const start = s.current_port || s.startPort || '';
      const end = s.next_port || s.endPort || '';
      
      if (filters.startPort && start !== filters.startPort) return false;
      if (filters.endPort && end !== filters.endPort) return false;
      if (filters.types && filters.types.length && !filters.types.includes(s.type)) return false;
      if (filters.minCapacity && (s.capacity_tons || s.capacityTons || 0) < filters.minCapacity) return false;
      
      if (searchText) {
        const q = searchText.toLowerCase();
        const hay = `${s.name} ${s.type} ${start} ${end} ${s.ship_owner || s.ownerCompany || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "newest") {
      out = out.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return out;
  }, [filters, searchText, sortBy, sourceShips]);

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
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Paginate filtered results
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedShips = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="ship-search-page">
      <div className="shipssearch-container container">
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

          <ShipList ships={paginatedShips} onView={handleView} onApply={handleApply} />
          
          <Pagination 
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            showInfo={true}
          />
        </main>
      </div>
    </div>
  );
}
