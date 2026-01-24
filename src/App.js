import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Footer from "./components/Footer";
import ScorePurchase from "./components/ScorePurchase";

import CartPage from "./pages/CartPage";
import ProductModal from "./components/ProductModal";
import ArticleView from "./pages/ArticleView";
import NewArticle from "./pages/NewArticle";
import Articles from "./pages/Articles";
import Library from "./pages/Library";
import Signup from "./pages/Signup";
import Notice from "./components/Notice";
import ShipSearch from "./pages/ShipSearch";
import ShipDetail from "./pages/ShipDetail";
import ShipApply from "./pages/ShipApply";
import Applications from "./pages/Applications";
import MyAccount from "./pages/MyAccount";

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
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

  function handleLoginToggle() {
    if (!loggedIn) {
      setLoggedIn(true);
      setNotice("Welcome back — you are now signed in");
    } else {
      setLoggedIn(false);
      setNotice("You have been signed out");
    }
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
        loggedIn={loggedIn}
        onLoginToggle={handleLoginToggle}
        onScoreClick={() => setShowScorePurchase(true)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop onBuyNow={setSelectedProduct} />} />
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
        <Route path="/my-account" element={<MyAccount />} />
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
      <Footer />
    </BrowserRouter>
  );
}

export default App;
