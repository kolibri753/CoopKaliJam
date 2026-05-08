import React, { useState } from "react";
import "./styles.css";
import {
  Difficulty,
  DifficultyTypes,
  TuneNames,
} from "../../types/DifficultyTypes";
import ModalComponent from "../ModalComponent";
import HelpButton from "../common/HelpButton";

interface StartMenuProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onSelectDifficulty }) => {
  const difficulties: Difficulty[] = Object.values(DifficultyTypes);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const handleSelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleStart = () => {
    if (selectedDifficulty) {
      onSelectDifficulty(selectedDifficulty);
    }
  };

  const handleHelp = () => {
    setIsHelpModalOpen(true);
  };

  const closeHelpModal = () => {
    setIsHelpModalOpen(false);
  };

  return (
    <div className="menu__container">
      <div className="menu__header">
        <h2 className="menu__action">{Rune.t("Choose Difficulty")}</h2>
        <HelpButton onClick={handleHelp} />
      </div>
      <ul className="menu__list">
        {difficulties.map((difficulty) => (
          <li key={difficulty} className="menu__item">
            <button
              className={`menu__button ${
                selectedDifficulty === difficulty ? "selected" : ""
              }`}
              onClick={() => handleSelect(difficulty)}
            >
              <span className="menu__title">{Rune.t(difficulty)}</span>
              <p className="menu__description">
                {Rune.t(TuneNames[difficulty])}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <button
        className="start__button"
        onClick={handleStart}
        disabled={!selectedDifficulty}
      >
        {Rune.t("Start Game")}
      </button>

      {isHelpModalOpen && (
        <ModalComponent isOpen={isHelpModalOpen} onClose={closeHelpModal} />
      )}
    </div>
  );
};

export default StartMenu;
