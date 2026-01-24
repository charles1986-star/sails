import { useState } from "react";
import { purchaseScore, getWallet } from "../utils/walletUtils";
import "../styles/scoreModal.css";

export default function ScorePurchase({ isOpen, onClose, onPurchaseSuccess }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const wallet = getWallet();

  // Score packages (Upwork-inspired pricing)
  const packages = [
    { id: 1, score: 10, price: 9.99, bonus: 0 },
    { id: 2, score: 50, price: 40, bonus: 5, popular: true },
    { id: 3, score: 100, price: 75, bonus: 10 },
    { id: 4, score: 500, price: 350, bonus: 50 },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      try {
        const pkg = packages.find((p) => p.id === selectedPackage);
        const totalScore = pkg.score + pkg.bonus;
        
        purchaseScore(totalScore, paymentMethod);
        
        setIsProcessing(false);
        onPurchaseSuccess?.(`+${totalScore} Score purchased successfully!`);
        setSelectedPackage(null);
        onClose();
      } catch (error) {
        alert(`Purchase failed: ${error.message}`);
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="score-modal-overlay" onClick={onClose}>
      <div className="score-modal" onClick={(e) => e.stopPropagation()}>
        <div className="score-modal-header">
          <h2>Buy Connects</h2>
          <p className="score-subtitle">
            Use Connects to unlock premium content and features
          </p>
          <button className="score-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="score-current-balance">
          <span className="balance-label">Your Current Balance</span>
          <span className="balance-amount">{wallet.balance}</span>
        </div>

        <div className="score-packages">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`score-package ${selectedPackage === pkg.id ? "selected" : ""} ${
                pkg.popular ? "popular" : ""
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && <span className="popular-badge">Most Popular</span>}
              
              <div className="package-score">
                <span className="score-big">{pkg.score}</span>
                <span className="score-label">Connects</span>
              </div>

              {pkg.bonus > 0 && (
                <div className="package-bonus">
                  <span className="bonus-label">+ {pkg.bonus} Bonus</span>
                </div>
              )}

              <div className="package-price">
                ${pkg.price.toFixed(2)}
              </div>

              <div className="package-value">
                ${(pkg.price / (pkg.score + pkg.bonus)).toFixed(2)}/Connect
              </div>

              <button className="package-select-btn">
                {selectedPackage === pkg.id ? "✓ Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>

        <div className="score-payment-method">
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="payment-select"
          >
            <option value="card">Credit/Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="google_pay">Google Pay</option>
            <option value="apple_pay">Apple Pay</option>
          </select>
        </div>

        <div className="score-modal-footer">
          <button className="score-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="score-purchase-btn"
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
          >
            {isProcessing ? "Processing..." : "Buy Connects"}
          </button>
        </div>

        <div className="score-info">
          <p>💡 Connects are non-refundable. Use them to unlock exclusive content.</p>
        </div>
      </div>
    </div>
  );
}
