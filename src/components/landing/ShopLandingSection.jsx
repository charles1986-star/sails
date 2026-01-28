import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ShopLandingSection.css";


const ShopLandingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="shop-landing">
      <div className="shop-landing__content">
        {/* LEFT SIDE */}
        <div className="shop-landing__text">
          <h2>Ship Supplies Shop</h2>
          <p>
            Buy verified maritime equipment, spare parts, and ship essentials
            from trusted suppliers. Simple ordering. Secure payments.
          </p>

          <button
            className="shop-landing__btn"
            onClick={() => navigate("/shop")}
          >
            Visit Shop →
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="shop-landing__image"
          onClick={() => navigate("/shop")}
        >
          <img src="/images/shop-landing.png" alt="Ship supplies e-shop" />
        </div>
      </div>
    </section>
  );
};

export default ShopLandingSection;
