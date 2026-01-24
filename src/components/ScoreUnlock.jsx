import { useState } from "react";
import { deductScore, getWallet, isContentUnlocked } from "../utils/walletUtils";
import "../styles/scoreUnlock.css";

export default function ScoreUnlock({ contentId, contentType, amount, title, onUnlock }) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const wallet = getWallet();
  const alreadyUnlocked = isContentUnlocked(contentId);

  const handleUnlock = () => {
    if (wallet.balance < amount) {
      alert(`Insufficient Connects. You need ${amount} but have ${wallet.balance}`);
      return;
    }

    setIsUnlocking(true);
    
    // Simulate unlock processing
    setTimeout(() => {
      const result = deductScore(contentId, contentType, amount);
      
      if (result.success) {
        alert(result.message);
        window.dispatchEvent(new Event("walletUpdated"));
        onUnlock?.(result.wallet);
      } else {
        alert(result.message);
      }
      
      setIsUnlocking(false);
    }, 1000);
  };

  if (alreadyUnlocked) {
    return (
      <div className="score-unlock-card unlocked">
        <div className="unlocked-badge">✓ Already Unlocked</div>
        <p className="unlocked-text">You have access to this content</p>
      </div>
    );
  }

  return (
    <div className="score-unlock-card">
      <div className="unlock-content">
        <div className="unlock-info">
          <span className="unlock-icon">🔒</span>
          <div>
            <p className="unlock-label">Premium Content</p>
            <p className="unlock-description">{title}</p>
          </div>
        </div>

        <div className="unlock-price">
          <span className="price-amount">{amount}</span>
          <span className="price-unit">Connects</span>
        </div>
      </div>

      <div className="unlock-balance">
        <span className="balance-text">Your balance: {wallet.balance}</span>
        {wallet.balance < amount && (
          <span className="insufficient">Insufficient Connects</span>
        )}
      </div>

      <button
        className="unlock-btn"
        onClick={handleUnlock}
        disabled={wallet.balance < amount || isUnlocking}
      >
        {isUnlocking ? "Unlocking..." : `Unlock for ${amount}`}
      </button>
    </div>
  );
}
