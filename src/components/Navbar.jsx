import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getWallet } from "../utils/walletUtils";
import "../styles/navbar.css";

export default function Navbar({ cartCount, loggedIn, onLoginToggle, onScoreClick }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (loggedIn) {
      const wallet = getWallet();
      setBalance(wallet.balance);
    }
  }, [loggedIn]);

  // Refresh balance when score changes
  useEffect(() => {
    const handleWalletUpdate = () => {
      const wallet = getWallet();
      setBalance(wallet.balance);
    };

    window.addEventListener("walletUpdated", handleWalletUpdate);
    return () => window.removeEventListener("walletUpdated", handleWalletUpdate);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo updated for Sail Transport */}
        <div className="navbar-logo logo">
          <img src="/images/logo.png" alt="Sail Transport Logo" />
          Sail Transport
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/ships">Ship Search</Link>
          <Link to="/applications">Applications</Link>
          <Link to="/games">Games</Link>
          <Link to="/library">Library</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/articles">Article</Link>
          {loggedIn && (
            <>
              <Link to="/cart">🛒 Cart ({cartCount})</Link>
              <Link to="/transactions">📜 Transactions</Link>
              <Link to="/my-account">Go to My Account</Link>
            </>
          )}
        </nav>

        <div className="auth-actions">
          {loggedIn && (
            <button className="score-btn" onClick={onScoreClick}>
              <span className="score-icon">⭐</span>
              <span className="score-value">{balance}</span>
              <span className="score-label">Connects</span>
            </button>
          )}

          {!loggedIn && (
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          )}

          <button className="login-btn" onClick={onLoginToggle}>
            {loggedIn ? "Logout" : "Login"}
          </button>
    
        </div>
      </div>
    </header>
  );
}
