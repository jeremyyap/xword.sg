import CrosswordCell from "./CrosswordCell";
import { CellSelection, CrosswordData } from "./CrosswordData";

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
    downClues,
    acrossClueNumbers,
    downClueNumbers,
  } = data;
  const { row: activeRow, col: activeCol, horizontal } = selection;
  const activeClue = horizontal
    ? acrossClueNumbers[activeRow][activeCol]
    : downClueNumbers[activeRow][activeCol];

  const handleClick = ({ row, col }: { row: number; col: number }) => {
    const { row: oldRow, col: oldCol, horizontal: oldHorizontal } = selection;
    const horizontal = row === oldRow && col === oldCol ? !oldHorizontal : true;
    setSelection({ row, col, horizontal });
  };

  const clues = horizontal ? acrossClues : downClues;
  const clueText = activeClue === null ? "" : clues[activeClue];

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        height={600}
        width={600}
        style={{ userSelect: "none" }}
      >
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
                    ? acrossClueNumbers[row][col]
                    : downClueNumbers[row][col]) === activeClue
                }
                onClick={handleClick}
              />
            );
          }),
        )}
      </svg>
      <div>
        <strong>
          {activeClue}
          {horizontal ? "A" : "D"}
        </strong>{" "}
        {clueText}
      </div>
    </>
  );
}
