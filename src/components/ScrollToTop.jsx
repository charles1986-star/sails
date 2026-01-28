import { useEffect, useState } from "react";
import "../styles/ScrollToTop.css";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 280);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
    
      className={`scroll-top-btn ${visible ? "show" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg
        viewBox="0 0 64 64"
        width="22"
        height="22"
        aria-hidden="true"
        >
      
        <path
            d="M32 6v22"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
        />

        <circle
            cx="32"
            cy="10"
            r="4"
            stroke="white"
            strokeWidth="3"
            fill="none"
        />

        <path
            d="M16 34c2 10 9 18 16 18s14-8 16-18"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />

        <path
            d="M16 34h-6M48 34h6"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
        />
        </svg>

    </button>
  );
}
