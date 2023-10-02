type Props = {
  text: string;
  onHide: () => void;
};

export default function Modal({ text, onHide }: Props) {
  return (
    <div className="modal">
      <div className="close-button" onClick={onHide}>
        &times;
      </div>
      <div>{text}</div>
    </div>
  );
}
