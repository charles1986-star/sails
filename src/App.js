import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Footer from "./components/Footer";
import ScorePurchase from "./components/ScorePurchase";
import LotteryIcon from "./components/LotteryIcon";

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
import { initializeAuth, logoutUser } from "./utils/auth";
import { logout, updateUserScore } from "./redux/slices/authSlice";
import { addItem } from "./redux/slices/cartSlice";
import useUserState from './hooks/useUserState';


// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTransactions from "./pages/admin/Transactions";
import TransactionCreate from "./pages/admin/TransactionCreate";
import TransactionEdit from "./pages/admin/TransactionEdit";
import AdminBooks from "./pages/admin/Books";
import AdminMedia from "./pages/admin/Media";
import MediaCreate from "./pages/admin/MediaCreate";
import MediaEdit from "./pages/admin/MediaEdit";
import AdminArticles from "./pages/admin/Articles";
import ArticleCreate from "./pages/admin/ArticleCreate";
import ArticleEdit from "./pages/admin/ArticleEdit";
import BookCreate from "./pages/admin/BookCreate";
import BookEdit from "./pages/admin/BookEdit";
import AdminApplications from "./pages/admin/Applications";
import AdminApplicationEdit from "./pages/admin/ApplicationEdit";
import AdminShops from "./pages/admin/Shops";
import AdminOrders from "./pages/admin/AdminOrders";
import ShopCreate from "./pages/admin/ShopCreate";
import ShopEdit from "./pages/admin/ShopEdit";
import AdminShipCategories from "./pages/admin/ShopCategories";
import ShopCategoryCreate from "./pages/admin/ShopCategoryCreate";
import ShopCategoryEdit from "./pages/admin/ShopCategoryEdit";
import AdminShips from "./pages/admin/Ships";
import ShipCreate from "./pages/admin/ShipCreate";
import ShipEdit from "./pages/admin/ShipEdit";
import AdminPorts from "./pages/admin/Ports";
import PortCreate from "./pages/admin/PortCreate";
import PortEdit from "./pages/admin/PortEdit";
import AdminGames from "./pages/admin/Games";
import GameCreate from "./pages/admin/GameCreate";
import GameEdit from "./pages/admin/GameEdit";
import AdminCategories from "./pages/admin/Categories";
import CategoryCreate from "./pages/admin/CategoryCreate";
import CategoryEdit from "./pages/admin/CategoryEdit";
import EntityCategories from "./pages/admin/EntityCategories";
import EntityCategoryCreate from "./pages/admin/EntityCategoryCreate";
import EntityCategoryEdit from "./pages/admin/EntityCategoryEdit";
import AdminLayout from "./components/AdminLayout";

import { useNavigate } from "react-router-dom";

// Simple auth check without useEffect to prevent infinite loops
const ProtectedRoute = ({ element, requiredRole = null, user = null, isLoggedIn = false }) => {
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return element;
};

function App() {
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const cart = useSelector((s) => s.cart.items);
  const [notice, setNotice] = useState(null);
  const [showScorePurchase, setShowScorePurchase] = useState(false);

  const dispatch = useDispatch();

  const addToCart = (product, quantity = 1) => {
    dispatch(addItem({ ...product, quantity }));
    setNotice(`${product.title || product.name} x${quantity} added to cart`);
    setSelectedProduct(null);
  };

  useEffect(() => {
    // Initialize Redux auth state from localStorage on mount
    initializeAuth();
  }, []);
  
  // keep user state (score/anchors) refreshed
  useUserState();
  function handleLoginClick() {
    // route to login page
    window.location.href = '/signup';
  }

  function handleLogout() {
    logoutUser();
    dispatch(logout());
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
        <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/" />} />
        
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


        <Route path="/admin/*" element={<ProtectedRoute element={<AdminLayout />} requiredRole="admin" isLoggedIn={isLoggedIn} user={user} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id/edit" element={<AdminApplicationEdit />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="transactions/new" element={<TransactionCreate />} />
          <Route path="transactions/:id/edit" element={<TransactionEdit />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/new" element={<BookCreate />} />
          <Route path="books/:id/edit" element={<BookEdit />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="media/new" element={<MediaCreate />} />
          <Route path="media/:id/edit" element={<MediaEdit />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<ArticleCreate />} />
          <Route path="articles/:id/edit" element={<ArticleEdit />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="shops/new" element={<ShopCreate />} />
          <Route path="shops/:id/edit" element={<ShopEdit />} />
          <Route path="shop-categories" element={<AdminShipCategories />} />
          <Route path="shop-categories/create" element={<ShopCategoryCreate />} />
          <Route path="shop-categories/edit/:id" element={<ShopCategoryEdit />} />
          <Route path="ships" element={<AdminShips />} />
          <Route path="ships/new" element={<ShipCreate />} />
          <Route path="ships/:id/edit" element={<ShipEdit />} />
          <Route path="ports" element={<AdminPorts />} />
          <Route path="ports/new" element={<PortCreate />} />
          <Route path="ports/:id/edit" element={<PortEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<CategoryCreate />} />
          <Route path="categories/edit/:id" element={<CategoryEdit />} />
          <Route path="books-categories" element={<EntityCategories />} />
          <Route path="books-categories/create" element={<EntityCategoryCreate />} />
          <Route path="books-categories/:id" element={<EntityCategoryEdit />} />
          <Route path="media-categories" element={<EntityCategories />} />
          <Route path="media-categories/create" element={<EntityCategoryCreate />} />
          <Route path="media-categories/:id" element={<EntityCategoryEdit />} />
          <Route path="articles-categories" element={<EntityCategories />} />
          <Route path="articles-categories/create" element={<EntityCategoryCreate />} />
          <Route path="articles-categories/:id" element={<EntityCategoryEdit />} />
          <Route path="games-categories" element={<EntityCategories />} />
          <Route path="games-categories/create" element={<EntityCategoryCreate />} />
          <Route path="games-categories/:id" element={<EntityCategoryEdit />} />
          <Route path="games" element={<AdminGames />} />
          <Route path="games/new" element={<GameCreate />} />
          <Route path="games/:id/edit" element={<GameEdit />} />
        </Route>
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
      <LotteryIcon />
    </BrowserRouter>
  );
}

export default App;
