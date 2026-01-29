import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/GameSections.css"; // assuming you keep shared landing section styles

function GamesIntro() {
  const navigate = useNavigate();

  return (
    <section
      className="landing-section games-intro"
      onClick={() => navigate("/games")}
    >
      <div className="section-content">
        {/* Left: Image */}
        <div className="section-image">
          <img src="/media-landing.png" alt="Games Intro" />
        </div>

        {/* Right: Text */}
        <div className="section-text">
          <h2>Discover Marine-Themed Games</h2>
          <p>
            Dive into our interactive games and challenge yourself with fun
            ship and sailing adventures. Click here to explore all games.
          </p>
        </div>
      </div>
    </section>
  );
}

export default GamesIntro;
