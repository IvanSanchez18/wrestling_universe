import { useEffect } from "react";
import "./victoryView.scss"

const VictoryView = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="victory-screen">
      <div className="victory-content">
        <h1 className="victory-title">YOU WIN</h1>
        <p className="victory-subtitle">ALL OPPONENTS DEFEATED</p>

        <div className="victory-divider" />

        <p className="victory-run">MASTERFUL PERFORMANCE</p>
      </div>
    </div>
  );
};

export default VictoryView;