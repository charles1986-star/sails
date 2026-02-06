import { useState, useRef } from "react";
import "../styles/prizeWheel.css";
import { addAnchors } from "../utils/walletUtils";

const PRIZES = [
  { label: "10 ⚓", value: 10, weight: 30 },
  { label: "25 ⚓", value: 25, weight: 20 },
  { label: "50 ⚓", value: 50, weight: 10 },
  { label: "💎 Bonus", value: 100, weight: 5 },
  { label: "No Prize", value: 0, weight: 35 },
];

export default function PrizeWheel() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  // Pick prize based on weight
  function pickPrize() {
    const totalWeight = PRIZES.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * totalWeight;
    for (const p of PRIZES) {
      if (r < p.weight) return p;
      r -= p.weight;
    }
  }

  // Spin the wheel with multiple rotations
  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const prize = pickPrize();
    const index = PRIZES.indexOf(prize);
    const slice = 360 / PRIZES.length;

    // Random offset in slice for realism
    const randomOffset = Math.random() * slice * 0.8 - slice * 0.4;

    // Total degrees: 5 full spins + prize angle
    const deg = 360 * 5 + index * slice + randomOffset;

    // Animate with CSS transition
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
      wheelRef.current.style.transform = `rotate(${deg}deg)`;
    }

    // After spinning, set the result
    setTimeout(() => {
      setRotation((prev) => prev + deg); // Keep rotation cumulative
      setResult(prize);
      if (prize.value > 0) addAnchors(prize.value);
      setSpinning(false);

      // Reset transition to allow next spin
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
        wheelRef.current.style.transform = `rotate(${rotation + deg}deg)`;
      }
    }, 5200); // Match animation duration
  }

  return (
    <div className="wheel-container">
      <div className="wheel-wrapper">
        <div className="wheel" ref={wheelRef}>
          {PRIZES.map((p, i) => (
            <div
              key={i}
              className="wheel-segment"
              style={{ transform: `rotate(${i * (360 / PRIZES.length)}deg)` }}
            >
              <span>{p.label}</span>
            </div>
          ))}
        </div>
        <div className="wheel-pointer">▲</div>
      </div>

      <button className="spin-btn" disabled={spinning} onClick={spin}>
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </button>

      {result && (
        <div className="wheel-result">
          🎉 You won <strong>{result.label}</strong>
        </div>
      )}
    </div>
  );
}
