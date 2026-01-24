import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getWallet, getPurchaseTransactions, getContentTransactions } from "../utils/walletUtils";
import ScorePurchase from "../components/ScorePurchase";
import "../styles/myAccount.css";

export default function MyAccount() {
  const wallet = getWallet();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const purchaseTransactions = getPurchaseTransactions();
  const contentTransactions = getContentTransactions();

  const handlePurchaseSuccess = (message) => {
    alert(message);
    window.location.reload();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Navbar />
      <div className="my-account-container">
        <h1>My Account</h1>
        <div className="account-sections">
          <section className="account-info">
            <h2>My Info</h2>
            <div className="info-block">
              <p>
                <strong>User ID:</strong> {wallet.userId}
              </p>
              <p>
                <strong>Member Since:</strong> {formatDate(wallet.createdAt)}
              </p>
            </div>
          </section>

          <section className="account-score">
            <h2>My Connects (Score Wallet)</h2>
            <div className="score-card">
              <div className="score-display">
                <div className="balance-section">
                  <span className="balance-label">Current Balance</span>
                  <span className="balance-big">{wallet.balance}</span>
                  <span className="connects-label">Connects</span>
                </div>
                <button
                  className="buy-score-btn"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  Buy More Connects
                </button>
              </div>
              <div className="score-info-box">
                <p>💡 Use Connects to unlock premium content and features.</p>
                <p>Non-refundable once spent.</p>
              </div>
            </div>
          </section>

          <section className="account-transactions">
            <h2>Transaction History</h2>

            {(purchaseTransactions.length > 0 || contentTransactions.length > 0) ? (
              <div className="transactions-list">
                <div className="transactions-tabs">
                  <h3>Purchases & Unlocks</h3>
                </div>

                <div className="transactions-table">
                  <div className="table-header">
                    <div className="col-date">Date</div>
                    <div className="col-type">Type</div>
                    <div className="col-amount">Amount</div>
                    <div className="col-status">Status</div>
                  </div>

                  {[...purchaseTransactions, ...contentTransactions]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((transaction) => (
                      <div key={transaction.id} className="table-row">
                        <div className="col-date">
                          {formatDate(transaction.timestamp)}
                        </div>
                        <div className="col-type">
                          {transaction.type === "purchase" ? (
                            <span className="badge purchase">
                              Purchased {transaction.amount} Connects
                            </span>
                          ) : (
                            <span className="badge deduct">
                              Unlocked {transaction.contentType}
                            </span>
                          )}
                        </div>
                        <div className="col-amount">
                          {transaction.type === "purchase" ? (
                            <span className="amount-add">+{transaction.amount}</span>
                          ) : (
                            <span className="amount-remove">-{transaction.amount}</span>
                          )}
                        </div>
                        <div className="col-status">
                          <span className="status-completed">✓ Completed</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="no-transactions">
                <p>No transactions yet. Purchase Connects to get started!</p>
              </div>
            )}
          </section>

          <section className="account-articles">
            <h2>My Articles</h2>
            {/* Add article management */}
          </section>

          <section className="account-media">
            <h2>My Media</h2>
            {/* Add media management */}
          </section>
        </div>
      </div>

      <ScorePurchase
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <Footer />
    </>
  );
}