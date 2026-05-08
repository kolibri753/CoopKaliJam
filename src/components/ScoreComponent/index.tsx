import React from "react";
import "./styles.css";

interface ScoreComponentProps {
  score: number;
  difficulty: string;
}

const ScoreComponent: React.FC<ScoreComponentProps> = ({
  score,
  difficulty,
}) => {
  return (
    <div className={`score__container ${score >= 0 ? "positive" : "negative"}`}>
      <p className="score__value">
        <span className="score__level">{Rune.t(difficulty)}: </span>
        {score}
      </p>
    </div>
  );
};

export default ScoreComponent;
