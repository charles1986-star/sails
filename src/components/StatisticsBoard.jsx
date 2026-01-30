import React from "react";
import {
  FaUsers,
  FaMobileAlt,
  FaGamepad,
  FaShoppingCart,
  FaCoins,
} from "react-icons/fa";
import "../styles/StatisticsBoard.css";

const stats = [
  {
    label: "Total Users",
    value: "128,450",
    icon: <FaUsers />,
  },
  {
    label: "Mobile Logins",
    value: "82,310",
    icon: <FaMobileAlt />,
  },
  {
    label: "Players in Game Rooms",
    value: "1,248",
    icon: <FaGamepad />,
  },
  {
    label: "eShop Products",
    value: "3,620",
    icon: <FaShoppingCart />,
  },
  {
    label: "Total Transactions",
    value: "$9.8M",
    icon: <FaCoins />,
  },
];

function StatisticsBoard() {
  return (
    <section className="statistics-section">
      <div className="statistics-header">
        <h2>Platform Statistics</h2>
        <p>Live overview of activity across the Sails ecosystem</p>
      </div>

      <div className="statistics-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatisticsBoard;
