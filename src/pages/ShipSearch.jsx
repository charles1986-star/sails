import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShipFilterPanel from "../components/ShipFilterPanel";
import ShipList from "../components/ShipList";
import Pagination from "../components/Pagination";
import { setShips } from "../redux/slices/shipSlice";
import axios from "axios";
import "../styles/shipsearch.css";

const API_URL = "http://localhost:5000/api";

export default function ShipSearch() {
  const [filters, setFilters] = useState({ startPortId: "", endPortId: "", maxDistance: null, types: [], availableAfter: null, minCapacity: null });
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [ports, setPorts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const itemsPerPage = 12;

  const dispatch = useDispatch();
  const shipsFromStore = useSelector((state) => state.ships.ships);

  // Load ports and ships from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active ports
        const portsRes = await axios.get(`${API_URL}/ports-list`);
        if (portsRes?.data?.data) {
          setPorts(portsRes.data.data);
        }

        // Load ships
        const shipsRes = await axios.get(`${API_URL}/ships`);
        if (shipsRes?.data?.data) {
          dispatch(setShips(shipsRes.data.data));
        }
      } catch (err) {
        console.error("Failed to load data from API:", err);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, [dispatch]);

  const sourceShips = shipsFromStore || [];

  // Get unique types
  const typesList = useMemo(() => Array.from(new Set(sourceShips.map((s) => s.type).filter(Boolean))), [sourceShips]);

  const filtered = useMemo(() => {
    let out = sourceShips.filter((s) => {
      // Filter by start port ID
      if (filters.startPortId && s.start_port_id !== parseInt(filters.startPortId)) return false;
      // Filter by end port ID
      if (filters.endPortId && s.end_port_id !== parseInt(filters.endPortId)) return false;
      // Filter by types
      if (filters.types && filters.types.length && !filters.types.includes(s.type)) return false;
      // Filter by min capacity
      if (filters.minCapacity && (s.capacity_tons || 0) < filters.minCapacity) return false;
      
      // Filter by search text
      if (searchText) {
        const q = searchText.toLowerCase();
        const startPortName = ports.find(p => p.id === s.start_port_id)?.name || '';
        const endPortName = ports.find(p => p.id === s.end_port_id)?.name || '';
        const hay = `${s.name} ${s.type} ${startPortName} ${endPortName} ${s.ship_owner || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "newest") {
      out = out.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return out;
  }, [filters, searchText, sortBy, sourceShips, ports]);

  const navigate = useNavigate();

  const handleApply = (ship) => {
    navigate(`/ships/${ship.id}/apply`);
  };

  const handleView = (ship) => {
    navigate(`/ships/${ship.id}`);
  };

  const clearFilter = (key) => {
    if (key === "searchText") return setSearchText("");
    if (key === "all") return setFilters({ startPortId: "", endPortId: "", maxDistance: null, types: [], availableAfter: null, minCapacity: null });
    setFilters((prev) => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : "" }));
    setCurrentPage(1);
  };

  // Paginate filtered results
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedShips = filtered.slice(startIdx, startIdx + itemsPerPage);

  if (loadingData) {
    return (
      <div className="ship-search-page">
        <div className="container">
          <div className="no-results">Loading ships...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ship-search-page">
      <div className="shipssearch-container container">
        <ShipFilterPanel 
          filters={filters} 
          onChange={setFilters} 
          ports={ports} 
          types={typesList} 
          onClear={() => clearFilter("all")} 
        />

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
            {filters.startPortId && (
              <button className="chip" onClick={() => setFilters({ ...filters, startPortId: "" })}>
                From: {ports.find(p => p.id === parseInt(filters.startPortId))?.name} ×
              </button>
            )}
            {filters.endPortId && (
              <button className="chip" onClick={() => setFilters({ ...filters, endPortId: "" })}>
                To: {ports.find(p => p.id === parseInt(filters.endPortId))?.name} ×
              </button>
            )}
            {filters.types && filters.types.map((t) => (
              <button key={t} className="chip" onClick={() => setFilters({ ...filters, types: filters.types.filter(x => x !== t) })}>
                {t} ×
              </button>
            ))}
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
