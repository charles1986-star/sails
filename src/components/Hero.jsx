
import React, { useEffect, useState } from "react";
import "../styles/hero.css";
import { useNavigate } from "react-router-dom";


function Hero() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger animation after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContent = () => {
    document
      .getElementById("main-content")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(/images/your-ship-hero.jpg)`,
      }}
    >
      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Animated Content */}
      <div className={`hero-content ${visible ? "show" : ""}`}>
        <span className="hero-badge">Maritime Digital Platform</span>

        <h1 class="landing-hero-title">
          Trade, Play, and Manage Sails
          <br />
          in One Platform
        </h1>

        <p>
          Secure transactions, digital shops, games, and media — built for the
          maritime ecosystem.
        </p>

        <div className="hero-actions">
          <button className="primary" onClick={scrollToContent}>
            Explore Platform
          </button>

          <button
            className="secondary"
            onClick={() => navigate("/sails")}
          >
            Sails Transactions
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;