import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Footer from "./components/Footer";
import ScorePurchase from "./components/ScorePurchase";

import CartPage from "./pages/CartPage";
import ProductModal from "./components/ProductModal";
import ArticleView from "./pages/ArticleView";
import NewArticle from "./pages/NewArticle";
import Articles from "./pages/Articles";
import Library from "./pages/Library";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Notice from "./components/Notice";
import ShipSearch from "./pages/ShipSearch";
import ShipDetail from "./pages/ShipDetail";
import ShipApply from "./pages/ShipApply";
import Applications from "./pages/Applications";
import MyAccount from "./pages/MyAccount";
import SailsIntro from "./components/landing/SailsIntro";
import ScrollToTop from "./components/ScrollToTop";
import { getCurrentUser } from "./utils/auth";

// Admin pages
import AdminTransactions from "./pages/admin/Transactions";
import AdminBooks from "./pages/admin/Books";
import AdminMedia from "./pages/admin/Media";
import AdminArticles from "./pages/admin/Articles";
import AdminShops from "./pages/admin/Shops";
import AdminShips from "./pages/admin/Ships";
import AdminGames from "./pages/admin/Games";


function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState(null);
  const [showScorePurchase, setShowScorePurchase] = useState(false);

  const addToCart = (product, quantity) => {
    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      const updatedCart = cart.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setNotice(`${product.title} x${quantity} added to cart`);
    setSelectedProduct(null);
  };

  useEffect(() => {
    // load current user from localStorage (auth util)
    try {
      const u = getCurrentUser();
      if (u) {
        setUser(u);
        setLoggedIn(true);
      }
    } catch (e) {}
  }, []);

  function handleLoginClick() {
    // route to login page
    window.location.href = '/signup';
  }

  function handleLogout() {
    localStorage.removeItem('sails_current_user');
    localStorage.removeItem('sails_auth_token');
    setUser(null);
    setLoggedIn(false);
    setNotice('You have been signed out');
  }

  const handlePurchaseSuccess = (message) => {
    setNotice(message);
    // Dispatch custom event to update navbar balance
    window.dispatchEvent(new Event("walletUpdated"));
  };

  // Protected route component
  const ProtectedRoute = ({ element, requiredRole = null }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <BrowserRouter>
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        user={user}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        onScoreClick={() => setShowScorePurchase(true)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop onBuyNow={setSelectedProduct} onAddToCart={addToCart} />} />
        <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} onBuyNow={setSelectedProduct} />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/cart" element={loggedIn ? <CartPage cart={cart} setCart={setCart} /> : <Navigate to="/" />} />
        
        <Route path="/articles" element={<Articles />} />
        <Route path="/ships" element={<ShipSearch />} />
        <Route path="/ships/:id" element={<ShipDetail />} />
        <Route path="/ships/:id/apply" element={<ShipApply />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/articles/new" element={<NewArticle />} />
        <Route path="/articles/:id" element={<ArticleView />} />
        <Route path="/library" element={<Library />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-account" element={<MyAccount />} />
        
        {/* Admin routes */}
        {/* <Route path="/admin/transactions" element={<ProtectedRoute element={<AdminTransactions />} requiredRole="admin" />} />
        <Route path="/admin/books" element={<ProtectedRoute element={<AdminBooks />} requiredRole="admin" />} />
        <Route path="/admin/media" element={<ProtectedRoute element={<AdminMedia />} requiredRole="admin" />} />
        <Route path="/admin/articles" element={<ProtectedRoute element={<AdminArticles />} requiredRole="admin" />} />
        <Route path="/admin/shops" element={<ProtectedRoute element={<AdminShops />} requiredRole="admin" />} />
        <Route path="/admin/ships" element={<ProtectedRoute element={<AdminShips />} requiredRole="admin" />} />
        <Route path="/admin/games" element={<ProtectedRoute element={<AdminGames />} requiredRole="admin" />} /> */}


        <Route path="/admin/transactions" element={<ProtectedRoute element={<AdminTransactions />} requiredRole="admin" />} />
        <Route path="/admin/books" element={<ProtectedRoute element={<AdminBooks />} requiredRole="admin" />} />
        <Route path="/admin/media" element={<ProtectedRoute element={<AdminMedia />} requiredRole="admin" />} />
        <Route path="/admin/articles" element={<ProtectedRoute element={<AdminArticles />} requiredRole="admin" />} />
        <Route path="/admin/shops" element={<ProtectedRoute element={<AdminShops />} requiredRole="admin" />} />
        <Route path="/admin/ships" element={<ProtectedRoute element={<AdminShips />} requiredRole="admin" />} />
        <Route path="/admin/games" element={<ProtectedRoute element={<AdminGames />} requiredRole="admin" />} />
      </Routes>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      <ScorePurchase
        isOpen={showScorePurchase}
        onClose={() => setShowScorePurchase(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <Notice message={notice} onClose={() => setNotice(null)} />
      <ScrollToTop />
      <Footer />
     
    </BrowserRouter>
  );
}

export default App;
