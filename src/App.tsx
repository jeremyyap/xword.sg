import ipuzData from "./sample";
import CrosswordGrid from "./CrosswordGrid";
import { useState, useCallback, useEffect } from "react";
import { CellSelection } from "./CrosswordData";
import {
  getInitialActiveState,
  checkGrid,
  getNextCell,
  getPreviousCell,
} from "./gridUtils";
import useCrosswordData from "./useCrosswordData";
import useKeydownListener from "./useKeydownListener";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import useIsMobileBrowser from "./useIsMobileBrowser";

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

  const handleKeyboardPress = useCallback(
    (button: string) => {
      if (button === "{bksp}") {
        setSelection((selection) => {
          const newSelection = getPreviousCell(puzzleGrid, selection);
          handleInput("", newSelection);
          return newSelection;
        });
      } else {
        handleInput(button, selection);
        setSelection((selection) => getNextCell(puzzleGrid, selection));
      }
    },
    [handleInput, selection, puzzleGrid],
  );

  useKeydownListener(handleInput, puzzleGrid, selection, setSelection);

  useEffect(() => {
    if (checkGrid(inputGrid, solutionGrid)) {
      setCompleted(true);
    }
  }, [inputGrid, solutionGrid]);

  return (
    <>
      <CrosswordGrid
        data={crosswordData}
        inputGrid={inputGrid}
        selection={selection}
        setSelection={setSelection}
      />
      {useIsMobileBrowser() && <Keyboard
        layout={{
          default: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "Z X C V B N M {bksp}",
          ],
        }}
        theme="hg-theme-default dark"
        onKeyPress={handleKeyboardPress}
      />}
    </>
  );
}
