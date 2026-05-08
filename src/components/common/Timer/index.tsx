import React, { useEffect, useState } from "react";
import "./styles.css";
import { GameState } from "../../../logic";

interface TimerProps {
  game: GameState;
}

const Timer: React.FC<TimerProps> = ({ game }) => {
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    setIntervalId(id);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (game && game.currentNoteIndex + 1 === game.tabs.length) {
      // Game is over, stop the timer
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    }
  }, [game, intervalId]);

  const formattedTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="timer">
      <span className="timer__value">{formattedTime()}</span>
    </div>
  );
};

export default Timer;
