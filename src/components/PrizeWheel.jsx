import { useState, useRef, useEffect } from "react";
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { updateUserScore } from '../redux/slices/authSlice';
import "../styles/prizeWheel.css";

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
  const [canPlay, setCanPlay] = useState(false);
  const [userAnchors, setUserAnchors] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/prize-wheel/status', { headers: getAuthHeader() });
        const d = res.data.data;
        setCanPlay(!!d.canPlayToday);
        setUserAnchors(d.anchors || 0);
        setUserScore(d.score || 0);
      } catch (err) {
        console.error('Failed to fetch prize wheel status', err);
      }
    };
    loadStatus();
  }, []);

  // Pick prize based on weight
  function pickPrize() {
    const totalWeight = PRIZES.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * totalWeight;
    for (const p of PRIZES) {
      if (r < p.weight) return p;
      r -= p.weight;
    }
    return PRIZES[0];
  }

  // Spin the wheel with multiple rotations
  function spin() {
    if (spinning) return;
    if (!canPlay) {
      setResult({ label: 'You have already played today. Come back tomorrow.', value: 0, error: true });
      return;
    }

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

    // After spinning, set the result and persist to backend
    setTimeout(() => {
      setRotation((prev) => prev + deg);
      setResult(prize);

      (async () => {
        try {
          const res = await axios.post('http://localhost:5000/api/prize-wheel/spin', { reward: prize.value }, { headers: getAuthHeader() });
          const d = res.data.data;
          setUserAnchors(d.newAnchors || (userAnchors + (prize.value > 0 ? 1 : 0)));
          setUserScore(d.newScore || (userScore + prize.value));
          dispatch(updateUserScore(d.newScore || (userScore + prize.value)));
          setCanPlay(false);
        } catch (err) {
          console.error('Spin failed', err);
          const msg = err.response?.data?.msg || 'Spin failed';
          setResult({ label: msg, value: 0, error: true });
        } finally {
          setSpinning(false);
        }
      })();

      // Reset transition to allow next spin
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
        wheelRef.current.style.transform = `rotate(${rotation + deg}deg)`;
      }
    }, 5200);
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
        {spinning ? "Spinning..." : (canPlay ? 'Spin the Wheel' : 'Already Played Today')}
      </button>

      {result && !result.error && (
        <div className="wheel-result">
          🎉 You won <strong>{result.label}</strong>
        </div>
      )}

      {result && result.error && (
        <div className="wheel-result wheel-error">
          {result.label}
        </div>
      )}

      <div className="wheel-stats">
        <div>Anchors: <strong>{userAnchors}</strong></div>
        <div>Score: <strong>{userScore}</strong></div>
      </div>
    </div>
  );
}
