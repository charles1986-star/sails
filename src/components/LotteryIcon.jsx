import { useState } from "react";
import PrizeWheelModal from "./PrizeWheelModal";
import "../styles/prizeWheel.css";

export default function LotteryIcon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="lottery-fab" onClick={() => setOpen(true)}>
        ⚓
        <span className="fab-label">Prize Wheel</span>
      </button>

      <PrizeWheelModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
