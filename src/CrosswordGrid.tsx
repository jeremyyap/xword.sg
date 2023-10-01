import { useCallback } from "react";
import CrosswordCell from "./CrosswordCell";
import { CellSelection, CrosswordData } from "./CrosswordData";
import { getClueStart } from "./gridUtils";

type Props = {
  data: CrosswordData;
  inputGrid: Array<Array<string>>;
  selection: CellSelection;
  setSelection: (selection: CellSelection) => void;
};

export default function CrosswordGrid({
  data,
  inputGrid,
  selection,
  setSelection,
}: Props) {
  const {
    dimensions: { height, width },
    puzzle: puzzleGrid,
    solution: solutionGrid,
    acrossClues,
    acrossClueNumbers,
    downClues,
    downClueNumbers,
    mappedAcrossClues,
    mappedDownClues,
  } = data;
  const { row: activeRow, col: activeCol, horizontal } = selection;
  const activeClue = horizontal
    ? mappedAcrossClues[activeRow][activeCol]
    : mappedDownClues[activeRow][activeCol];

  const handleClick = ({ row, col }: { row: number; col: number }) => {
    const { row: oldRow, col: oldCol, horizontal: oldHorizontal } = selection;
    const horizontal = row === oldRow && col === oldCol ? !oldHorizontal : true;
    setSelection({ row, col, horizontal });
  };

  const clues = horizontal ? acrossClues : downClues;
  const clueText = activeClue === null ? "" : clues[activeClue];

  const goToPreviousClue = useCallback(
    () => {
      const clueNumbers = horizontal ? acrossClueNumbers : downClueNumbers;
      const otherClueNumbers = horizontal ? downClueNumbers : acrossClueNumbers;
      const previousClueNumber = clueNumbers.findLast(clue => clue < activeClue!);
      if (previousClueNumber != null) {
        setSelection(getClueStart(puzzleGrid, previousClueNumber, horizontal));
      } else {
        setSelection(getClueStart(puzzleGrid, otherClueNumbers.slice(-1)[0], !horizontal));
      }
    }
  , [horizontal, acrossClueNumbers, downClueNumbers, activeClue, setSelection, puzzleGrid]);

  const goToNextClue = useCallback(
    () => {
      const clueNumbers = horizontal ? acrossClueNumbers : downClueNumbers;
      const otherClueNumbers = horizontal ? downClueNumbers : acrossClueNumbers;
      const nextClueNumber = clueNumbers.find(clue => clue > activeClue!);
      if (nextClueNumber != null) {
        setSelection(getClueStart(puzzleGrid, nextClueNumber, horizontal));
      } else {
        setSelection(getClueStart(puzzleGrid, otherClueNumbers[0], !horizontal));
      }
    }
  , [horizontal, acrossClueNumbers, downClueNumbers, activeClue, setSelection, puzzleGrid]);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} className="crossword-grid">
        {Array.from({ length: width }, (_, i) => i).flatMap((row) =>
          Array.from({ length: height }, (_, i) => i).map((col) => {
            return (
              <CrosswordCell
                key={`${row} ${col}`}
                row={row}
                col={col}
                answer={solutionGrid[row][col]}
                input={inputGrid[row][col]}
                cellInfo={puzzleGrid[row][col]}
                isActiveCell={activeRow === row && activeCol === col}
                isActiveClue={
                  (selection.horizontal
                    ? mappedAcrossClues[row][col]
                    : mappedDownClues[row][col]) === activeClue
                }
                onClick={handleClick}
              />
            );
          }),
        )}
      </svg>
      <div className="clue-bar">
        <div className="clue-arrow" onClick={goToPreviousClue}>&#10094;</div>
        <span className="clue-text">
        <strong>
          {activeClue}
          {horizontal ? "A" : "D"}
        </strong>{" "}
        {clueText}
        </span>
        <div className="clue-arrow" onClick={goToNextClue}>&#10095;</div>
      </div>
    </>
  );
}
