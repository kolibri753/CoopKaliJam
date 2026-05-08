import React, { useEffect } from "react";
import "./styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <div className="modal__header">
          <h2 className="modal__title">{Rune.t("How to Play")}</h2>
          <button className="close__button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal__main">
          <p className="modal__text">
            {Rune.t("1. Pick a tune and hit")} {" "}
            <span className="blue">{Rune.t("Start Game")}</span>.
          </p>
          <p className="modal__text">
            {Rune.t("2. The notes 🎵 you need to play are shown on tabs.")}
          </p>
          <p className="modal__text">
            {Rune.t("Note: If you")} <span className="blue">{Rune.t("can't find the note")}</span> {Rune.t("on your half of kalimba, it means your friend has it.")}
          </p>
          <p className="modal__text">{Rune.t("3. Find the kalimba key 🎹 and tap on it!")}</p>
          <p className="modal__text">
            {Rune.t("4. Hit it right, see green,")} <span className="green">{Rune.t("score up")}</span>{Rune.t(", and move on!")}
          </p>
          <p className="modal__text">
            {Rune.t("5. Oops, a mistake?")} <span className="red">{Rune.t("Score down")}</span>{Rune.t(", try again.")}
          </p>
          <p className="modal__text">
            {Rune.t("6. After all notes, check your results! Share them with friends and see who did the best!")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
