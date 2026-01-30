import React from "react";
import { FaTwitter, FaLinkedin, FaDiscord } from "react-icons/fa";
// import logo from "../assets/logo.png"; // Your sail logo
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <img src="/images/logo.png" alt="Sail Platform Logo" />
          <p>All-in-one platform for modern sail transport</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/sails">Sail Transactions</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/media">Media</a></li>
            <li><a href="/games">Games</a></li>
            <li><a href="/services">Services</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-resources">
          <h4>Resources</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-social">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
            <a href="#"><FaDiscord /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2026 Sail Platform. All rights reserved.
      </div>
    </footer>
  );
}
