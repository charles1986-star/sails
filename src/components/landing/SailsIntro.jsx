import { useNavigate } from "react-router-dom";
import "../../styles/SailsIntro.css";

function SailsIntro() {
  const navigate = useNavigate();

  return (
    <section
      className="sails-intro"
      onClick={() => navigate("/sails")}
      role="button"
    >
      <div className="sails-intro-image">
        <img
          src="/images/ship-transaction.jpg"
          alt="Sails transaction"
        />
      </div>

      <div className="sails-intro-content">
        <h2>Sails Transactions</h2>
        <p>
          Discover verified ships, compare capabilities, and manage maritime
          transactions with clarity and confidence.
        </p>
        <span className="sails-intro-link">
          Explore Transactions →
        </span>
      </div>
    </section>
  );
}

export default SailsIntro;
