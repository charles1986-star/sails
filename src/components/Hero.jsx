import React from "react";
import "../styles/hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">

        <div className="hero-text">
          <h1>How work should work</h1>
          <p>
            Forget the old rules. You can have the best people.
            Right now. Right here.
          </p>

          <div className="hero-buttons">
            <button className="primary">Find Talent</button>
            <button className="secondary">Find Work</button>
          </div>
        </div>

        <div className="hero-image">
          <img src="/hero.png" alt="Hero" />
        </div>

      </div>
    </section>
  );
}
