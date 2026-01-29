import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getWallet } from "../utils/walletUtils";
import Avatar from "./Avatar";
import "../styles/navbar.css";

export default function Navbar({ cartCount, loggedIn, onLoginToggle, onScoreClick }) {
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      const wallet = getWallet();
      setBalance(wallet.balance);
      setUserName(wallet.userName || "User");
      setUserAvatar(wallet.avatar || "default");
    }
  }, [loggedIn]);

  // Refresh balance when score changes
  useEffect(() => {
    const handleWalletUpdate = () => {
      const wallet = getWallet();
      setBalance(wallet.balance);
      setUserAvatar(wallet.avatar || "default");
    };

    window.addEventListener("walletUpdated", handleWalletUpdate);
    return () => window.removeEventListener("walletUpdated", handleWalletUpdate);
  }, []);

  const handleAvatarClick = () => {
    navigate("/my-account");
  };

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
          <Link to="/games">Games</Link>
          <Link to="/library">Library</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/articles">Article</Link>
        </nav>

        <div className="auth-actions">
          {loggedIn && (
            <>
              <button className="score-btn" onClick={onScoreClick}>
                <span className="score-icon">⭐</span>
                <span className="score-value">{balance}</span>
                <span className="score-label">Connects</span>
              </button>
              <div className="avatar-section">
                <Avatar 
                  name={userName} 
                  size={44}
                  avatar={userAvatar}
                  onClick={handleAvatarClick}
                />
              </div>
            </>
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
