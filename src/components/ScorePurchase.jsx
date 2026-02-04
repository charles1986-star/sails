import { useState, useMemo } from "react";
import { purchaseScore, getWallet } from "../utils/walletUtils";
import "../styles/scoreModal.css";

export default function ScorePurchase({
  isOpen,
  onClose,
  onPurchaseSuccess,
}) {
  const wallet = getWallet();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  /* ===============================
     Packages
  =============================== */
  const packages = [
    { id: 1, score: 10, price: 9.99 },
    { id: 2, score: 50, price: 40, bonus: 5, popular: true },
    { id: 3, score: 100, price: 75, bonus: 10 },
    { id: 4, score: 500, price: 350, bonus: 50 },
  ];

  const selected = useMemo(
    () => packages.find((p) => p.id === selectedPackage),
    [selectedPackage]
  );

  /* ===============================
     Purchase
  =============================== */
  const handlePurchase = async () => {
    if (!selected) return;

    setIsProcessing(true);

    setTimeout(() => {
      const total = selected.score + (selected.bonus || 0);

      purchaseScore(total, paymentMethod);

      onPurchaseSuccess?.(`+${total} Connects added`);
      setIsProcessing(false);
      setSelectedPackage(null);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  /* ===============================
     UI
  =============================== */
  return (
    <div className="score-overlay" onClick={onClose}>
      <div className="score-modal" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEADER ================= */}
        <header className="score-header">
          <div>
            <h2>Buy Connects</h2>
            <p>Unlock rooms, join games, and premium features</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>

        {/* ================= BALANCE ================= */}
        <div className="balance-card">
          <span>Your balance</span>
          <strong>{wallet.balance} Connects</strong>
        </div>

        {/* ================= PACKAGES ================= */}
        <div className="packages-grid">
          {packages.map((pkg) => {
            const total = pkg.score + (pkg.bonus || 0);
            const value = (pkg.price / total).toFixed(2);

            return (
              <div
                key={pkg.id}
                className={`pkg-card 
                  ${selectedPackage === pkg.id ? "active" : ""} 
                  ${pkg.popular ? "popular" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && <span className="badge">Best Value</span>}

                <div className="pkg-score">
                  {total}
                  <span>Connects</span>
                </div>

                {pkg.bonus && (
                  <div className="bonus">+ {pkg.bonus} bonus</div>
                )}

                <div className="pkg-price">${pkg.price.toFixed(2)}</div>
                <div className="pkg-value">${value}/connect</div>
              </div>
            );
          })}
        </div>

        {/* ================= PAYMENT ================= */}
        <div className="payment-row">
          <label>Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="card">Credit / Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="google_pay">Google Pay</option>
            <option value="apple_pay">Apple Pay</option>
          </select>
        </div>

        {/* ================= FOOTER ================= */}
        <footer className="score-footer">
          <button className="btn-light" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary"
            disabled={!selected || isProcessing}
            onClick={handlePurchase}
          >
            {isProcessing
              ? "Processing..."
              : selected
              ? `Buy ${selected.score + (selected.bonus || 0)} Connects`
              : "Select package"}
          </button>
        </footer>

        <div className="score-note">
          Connects are non-refundable. Secure payments.
        </div>
      </div>
    </div>
  );
}
