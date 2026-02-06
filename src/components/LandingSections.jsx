import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const tiles = [
  {
    id: "sails",
    title: "Sails Transactions",
    desc: "Discover and manage sail transport deals — post requests or find offers.",
    to: "/articles",
    emoji: "⛵",
  },
  {
    id: "shop",
    title: "Shop",
    desc: "Browse marine supplies, parts and equipment in our shop.",
    to: "/shop",
    emoji: "🛒",
  },
  {
    id: "media",
    title: "Media",
    desc: "Watch sail transport videos, webinars and news clips.",
    to: "/media",
    emoji: "🎬",
  },
  {
    id: "book",
    title: "Books & Guides",
    desc: "Authoritative guides on navigation, safety and logistics.",
    to: "/books",
    emoji: "📚",
  },
  {
    id: "interchange",
    title: "Interchange",
    desc: "Exchange cargo or routes with other shippers and operators.",
    to: "/interchange",
    emoji: "🔁",
  },
];

export default function LandingSections() {
  return (
    <section className="landing-sections">
      <div className="landing-container">
        <div className="landing-intro">
          <h2>Everything for modern sail transport</h2>
          <p className="lead">Find transactions, parts, media, guides and exchange opportunities — all in one place.</p>
        </div>

        
      </div>
    </section>
  );
}
