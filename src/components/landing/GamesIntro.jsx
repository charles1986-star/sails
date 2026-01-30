import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SailsIntro.css"; // assuming you keep shared landing section styles

function GamesIntro() {
  const navigate = useNavigate();

  return (
    <section
      className="sails-intro"
      onClick={() => navigate("/games")}
    > 
      {/* Right: Text */}
      <div className="sails-intro-content">
        <h2>Discover Marine-Themed Games</h2>
        <p>
          Dive into our interactive games and challenge yourself with fun
          ship and sailing adventures. Click here to explore all games.
        </p>
        <span className="sails-intro-link">
          Explore Transactions →
        </span>
      </div>
      {/* Left: Image */}
      <div className="sails-intro-image">
        <img
          src="/images/game-intro.png"
          alt="Games Intro"
        />
      </div>
      
      
      
    
    </section>
  );
}

export default GamesIntro;
