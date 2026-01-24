import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="col brand-col">
          <div className="brand-name">Sail</div>
          <div className="brand-desc">Modern sail transport marketplace</div>
        </div>

        <div className="col links-col-group">
          <div className="links-col">
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/pricing">Pricing</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="links-col">
            <h4>Platform</h4>
            <a href="/articles">Transactions</a>
            <a href="/shop">Shop</a>
            <a href="/media">Media</a>
          </div>

          <div className="links-col">
            <h4>Resources</h4>
            <a href="/support">Support</a>
            <a href="/faq">FAQ</a>
            <a href="/terms">Terms</a>
          </div>
        </div>

        <div className="col subscribe-col">
          <h4>Stay updated</h4>
          <p className="muted small">Get product updates, industry news and offers.</p>
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" aria-label="Email" />
            <button className="btn-primary">Subscribe</button>
          </form>

          <div className="socials-row">
            <a href="#" aria-label="Twitter" className="social">Twitter</a>
            <a href="#" aria-label="LinkedIn" className="social">LinkedIn</a>
            <a href="#" aria-label="YouTube" className="social">YouTube</a>
          </div>
        </div>

        <div className="footer-bottom">© 2026 Sail — Frontend Practice · Built for learning</div>
      </div>
    </footer>
  );
}
