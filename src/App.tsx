import "./App.css";
import ipuzData from "./sample";
import CrosswordGrid from "./CrosswordGrid";
import { useState, useCallback, useEffect } from "react";
import { CellSelection } from "./CrosswordData";
import { getInitialActiveState, checkGrid } from "./gridUtils";
import useCrosswordData from "./useCrosswordData";
import useKeydownListener from "./useKeydownListener";

export default function App() {
  const crosswordData = useCrosswordData(ipuzData);
  const {
    dimensions: { height, width },
    puzzle: puzzleGrid,
    solution: solutionGrid,
  } = crosswordData;
  const [inputGrid, setInputGrid] = useState(
    Array.from(
      {
        length: height,
      },
      () => new Array(width).fill(""),
    ),
  );
  const [completed, setCompleted] = useState(false);
  const [selection, setSelection] = useState(getInitialActiveState(puzzleGrid));

  const handleInput = useCallback(
    (input: string, cell: CellSelection) => {
      if (completed) {
        return;
      }

      setInputGrid((inputGrid) => {
        const { row, col } = cell;
        const newInputGrid = [...inputGrid];
        newInputGrid[row][col] = input;
        return newInputGrid;
      });
    },
    [completed],
  );

  useKeydownListener(handleInput, puzzleGrid, selection, setSelection);

  useEffect(() => {
    if (checkGrid(inputGrid, solutionGrid)) {
      setCompleted(true);
    }
  }, [inputGrid, solutionGrid]);

  return (
    <CrosswordGrid
      data={crosswordData}
      inputGrid={inputGrid}
      selection={selection}
      setSelection={setSelection}
    />
  );
}
