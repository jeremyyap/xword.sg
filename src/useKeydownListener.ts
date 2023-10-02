import { useCallback, useEffect } from "react";
import { CellData, CellSelection } from "./CrosswordData";
import { getNextCell, getPreviousCell } from "./gridUtils";

export default function useKeydownListener(
  handleInput: (input: string, cell: CellSelection) => void,
  puzzleGrid: Array<Array<CellData>>,
  selection: CellSelection,
  setSelection: React.Dispatch<React.SetStateAction<CellSelection>>,
) {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      if (e.code === "Tab") {
        e.preventDefault();
      }

      if (e.code === "ArrowDown" || e.code === "ArrowRight") {
        setSelection((selection) => {
          if ((e.code === "ArrowRight") !== selection.horizontal) {
            return { ...selection, horizontal: !selection.horizontal };
          }
          return getNextCell(puzzleGrid, selection);
        });
      }

      if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
        setSelection((selection) => {
          if ((e.code === "ArrowLeft") !== selection.horizontal) {
            return { ...selection, horizontal: !selection.horizontal };
          }
          return getPreviousCell(puzzleGrid, selection);
        });
      }

      if (e.code === "Delete") {
        handleInput("", selection);
      }

      if (e.code === "Backspace") {
        setSelection((selection) => {
          const newSelection = getPreviousCell(puzzleGrid, selection);
          handleInput("", newSelection);
          return newSelection;
        });
      }

      if (/^[a-z0-9]$/i.test(e.key)) {
        handleInput(e.key.toUpperCase(), selection);
        setSelection((selection) => getNextCell(puzzleGrid, selection));
      }
    },
    [handleInput, puzzleGrid, selection, setSelection],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);
}
