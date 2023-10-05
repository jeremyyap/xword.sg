import React from "react";

type Props = {
  content: React.ReactNode;
  onHide: () => void;
};

export default function Modal({ content, onHide }: Props) {
  return (
    <div className="modal-bg" onClick={onHide}>
      <div className="modal">
        <div className="close-button" onClick={onHide}>
          &times;
        </div>
        <div>{content}</div>
      </div>
    </div>
  );
}
