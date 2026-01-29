import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import { getWallet, updateUserProfile } from "../utils/walletUtils";
import ScorePurchase from "../components/ScorePurchase";
import "../styles/myAccount.css";

export default function MyAccount() {
  const wallet = getWallet();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userName, setUserName] = useState(wallet.userName || "User");
  const [selectedAvatar, setSelectedAvatar] = useState(wallet.avatar || "default");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const avatarOptions = [
    { name: "default", label: "Green" },
    { name: "blue", label: "Blue" },
    { name: "purple", label: "Purple" },
    { name: "red", label: "Red" },
    { name: "orange", label: "Orange" },
    { name: "green", label: "Green 2" },
    { name: "pink", label: "Pink" },
    { name: "teal", label: "Teal" },
  ];

  const handleProfileSave = () => {
    updateUserProfile({ userName, avatar: selectedAvatar });
    setSaveSuccess(true);
    window.dispatchEvent(new Event("walletUpdated"));
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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
     
      <div className="my-account-container">
        <div className="account-wrapper">
          {/* Left Sidebar Navigation */}
          <aside className="account-sidebar">
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="icon">👤</span>
                Profile Settings
              </button>
              <button 
                className={`sidebar-item ${activeTab === "cart" ? "active" : ""}`}
                onClick={() => setActiveTab("cart")}
              >
                <span className="icon">🛒</span>
                Cart
              </button>
              <button 
                className={`sidebar-item ${activeTab === "transactions" ? "active" : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                <span className="icon">📜</span>
                Transactions
              </button>
              <button 
                className={`sidebar-item ${activeTab === "articles" ? "active" : ""}`}
                onClick={() => setActiveTab("articles")}
              >
                <span className="icon">📝</span>
                My Articles
              </button>
              <button 
                className={`sidebar-item ${activeTab === "applications" ? "active" : ""}`}
                onClick={() => setActiveTab("applications")}
              >
                <span className="icon">📋</span>
                Applications
              </button>
              <button 
                className={`sidebar-item ${activeTab === "connects" ? "active" : ""}`}
                onClick={() => setActiveTab("connects")}
              >
                <span className="icon">⭐</span>
                My Connects
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="account-main">
            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>Profile Settings</h1>
                </div>

                <div className="profile-content">
                  <div className="avatar-section-large">
                    <div className="avatar-display">
                      <Avatar 
                        name={userName} 
                        size={120}
                        avatar={selectedAvatar}
                      />
                    </div>
                    <div className="avatar-info">
                      <p className="user-id"><strong>User ID:</strong> {wallet.userId}</p>
                      <p className="member-since"><strong>Member Since:</strong> {formatDate(wallet.createdAt)}</p>
                    </div>
                  </div>

                  <div className="profile-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Avatar Color</label>
                      <div className="avatar-grid">
                        {avatarOptions.map((option) => (
                          <button
                            key={option.name}
                            className={`avatar-option ${selectedAvatar === option.name ? "selected" : ""}`}
                            onClick={() => setSelectedAvatar(option.name)}
                            title={option.label}
                          >
                            <Avatar 
                              name="AB" 
                              size={60}
                              avatar={option.name}
                            />
                            <span className="label">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {saveSuccess && (
                      <div className="success-message">✓ Profile saved successfully!</div>
                    )}

                    <button 
                      className="btn-primary"
                      onClick={handleProfileSave}
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Cart Tab */}
            {activeTab === "cart" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>Shopping Cart</h1>
                </div>
                <div className="empty-state">
                  <p>Your cart is empty</p>
                  <Link to="/shop" className="btn-primary">Continue Shopping</Link>
                </div>
              </section>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>Transaction History</h1>
                </div>
                <div className="empty-state">
                  <p>No transactions yet</p>
                  <Link to="/shop" className="btn-primary">Start Shopping</Link>
                </div>
              </section>
            )}

            {/* Articles Tab */}
            {activeTab === "articles" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>My Articles</h1>
                </div>
                <div className="empty-state">
                  <p>You haven't written any articles yet</p>
                  <Link to="/articles/new" className="btn-primary">Write Article</Link>
                </div>
              </section>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>My Applications</h1>
                </div>
                <div className="empty-state">
                  <p>No applications submitted</p>
                  <Link to="/ships" className="btn-primary">Browse Opportunities</Link>
                </div>
              </section>
            )}

            {/* Connects Tab */}
            {activeTab === "connects" && (
              <section className="account-section">
                <div className="section-header">
                  <h1>My Connects (Score Wallet)</h1>
                </div>
                
                <div className="score-card-large">
                  <div className="score-display-large">
                    <div className="balance-section-large">
                      <span className="balance-label">Current Balance</span>
                      <span className="balance-big-large">⭐ {wallet.balance}</span>
                      <span className="connects-label">Connects Available</span>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => setShowPurchaseModal(true)}
                    >
                      Buy More Connects
                    </button>
                  </div>
                  <div className="score-info-box-large">
                    <p>💡 Use Connects to unlock premium content and features.</p>
                    <p>💳 Non-refundable once spent.</p>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {showPurchaseModal && (
        <ScorePurchase
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <Footer />
    </>
  );
}