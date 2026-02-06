import PrizeWheel from "./PrizeWheel";
import "../styles/prizeWheel.css";

export default function PrizeWheelModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="wheel-overlay" onClick={onClose}>
      <div className="wheel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wheel-header">
          <h2>⚓ Nautical Prize Wheel</h2>
          <p>Spin the wheel to earn Anchors</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <PrizeWheel />

        <div className="wheel-footer">
          <p className="wheel-note">
            🎁 1 free spin per day • Anchors can be used across the platform
          </p>
        </div>
      </div>
    </div>
  );
}
