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
      const u = localStorage.getItem('sails_current_user');
      if (u) setUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  function handleLoginClick() {
    // route to login page
    window.location.href = '/signup';
  }

  function handleLogout() {
    localStorage.removeItem('sails_current_user');
    setUser(null);
    setNotice('You have been signed out');
  }

  const handlePurchaseSuccess = (message) => {
    setNotice(message);
    // Dispatch custom event to update navbar balance
    window.dispatchEvent(new Event("walletUpdated"));
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
        <Route path="/product/:id" element={<ProductDetail />} />
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
