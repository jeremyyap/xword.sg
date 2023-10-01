import { useCallback, useEffect, useState } from "react";
import CrosswordCell from "./CrosswordCell";
import useCrosswordData, { IpuzData } from "./useCrosswordData";

type Props = {
  data: IpuzData;
}

export default function CrosswordGrid({ data }: Props) {
  const { dimensions: { height, width }, puzzle: puzzleGrid, solution: solutionGrid, acrossClues, downClues, acrossClueNumbers, downClueNumbers } = useCrosswordData(data);
  const [inputGrid, setInputGrid] = useState(Array.from({
    length: height
  }, () => new Array(width).fill('')));
  const [completed, setCompleted] = useState(false);
  const [selection, setSelection] = useState(getInitialActiveState(puzzleGrid));
  const {row: activeRow, col: activeCol, horizontal} = selection;
  const activeClue = horizontal ? acrossClueNumbers[activeRow][activeCol] : downClueNumbers[activeRow][activeCol];

  const handleInput = useCallback((input: string, cell: {row: number, col: number, horizontal: boolean}) => {
    if (completed) {
      return;
    }
    
    setInputGrid(inputGrid => {
      const {row, col} = cell;
      const newInputGrid = [...inputGrid];
      newInputGrid[row][col] = input;
      return newInputGrid;
    }) 
  }, [completed]);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
      setSelection(selection => {
        if ((e.code === 'ArrowRight') !== selection.horizontal) {
          return { ...selection, horizontal: !selection.horizontal };
        }
        return getNextCell(puzzleGrid, selection);
      });
    }

    if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
      setSelection(selection => {
        if ((e.code === 'ArrowLeft') !== selection.horizontal) {
          return { ...selection, horizontal: !selection.horizontal };
        }
        return getPreviousCell(puzzleGrid, selection);
      });
    }

    if (e.code === 'Delete') {
      handleInput('', selection);
    }

    if (e.code === 'Backspace') {
      setSelection(selection => {
        const newSelection = getPreviousCell(puzzleGrid, selection)
        handleInput('', newSelection);
        return newSelection;
      });
    }

    if (/^[a-z0-9]$/i.test(e.key)) {
      handleInput(e.key.toUpperCase(), selection);
      setSelection(selection => getNextCell(puzzleGrid, selection));
    }
  }, [selection, handleInput, puzzleGrid]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  useEffect(() => {
    if (checkGrid(inputGrid, solutionGrid)) {
      setCompleted(true);
    }
  }, [inputGrid, solutionGrid]);

  const handleClick = ({ row, col }: {row: number, col: number}) => {
    const {row: oldRow, col: oldCol, horizontal: oldHorizontal } = selection;
    const horizontal = row === oldRow && col === oldCol ? !oldHorizontal : true;
    setSelection({row, col, horizontal})
  }
  
  const clues = horizontal ? acrossClues : downClues;
  const clueText = activeClue === null ? '' : clues[activeClue];

  return <>
    <svg viewBox={`0 0 ${width} ${height}`} height={600} width={600}>
      {Array.from({length: width}, (_, i) => i).flatMap((row) => 
        Array.from({length: height}, (_, i) => i).map((col) => {
          return <CrosswordCell
            key={`${row} ${col}`}
            row={row}
            col={col}
            answer={solutionGrid[row][col]}
            input={inputGrid[row][col]}
            cellInfo={puzzleGrid[row][col]}
            isActiveCell={activeRow === row && activeCol === col}
            isActiveClue={(selection.horizontal ? acrossClueNumbers[row][col] : downClueNumbers[row][col]) === activeClue}
            onClick={handleClick}
          />
        })
      )}
    </svg>
    <div><strong>{activeClue}{horizontal ? 'A' : 'D'}</strong> {clueText}</div>
  </>
}

function checkGrid(inputGrid: IpuzData['puzzle'], answerGrid: IpuzData['puzzle']): boolean {
  for (let row = 0; row < answerGrid.length; row++) {
    for (let col = 0; col < answerGrid[0].length; col++) {
      if (answerGrid[row][col] != '#' && answerGrid[row][col] != inputGrid[row][col]) {
        return false;
      }
    }
  }
  return true;
}

function getInitialActiveState(grid: IpuzData['puzzle']): {row: number, col: number, horizontal: boolean} {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const cellInfo = grid[row][col];
      if (cellInfo !== '#') {
        return {row, col, horizontal: true};
      } 
    }
  }
  return {row: -1, col: -1, horizontal: true};
}

function getNextCell(grid: IpuzData['puzzle'], current: {row: number, col: number, horizontal: boolean}): {row: number, col: number, horizontal: boolean} {
  const width = grid[0].length;
  const height = grid.length;
  let {row, col} = current;
  const { horizontal } = current;

  if (horizontal) {
    do {
      col = (col + 1) % width;
      if (col === 0) {
        row = (row + 1) % height;
      }
    } while (grid[row][col] == '#');
  } else {
    do {
      row = (row + 1) % height;
      if (row === 0) {
        col = (col + 1) % width;
      }
    } while (grid[row][col] == '#');
  }
  return {row, col, horizontal};
}

function getPreviousCell(grid: IpuzData['puzzle'], current: {row: number, col: number, horizontal: boolean}): {row: number, col: number, horizontal: boolean} {
  const width = grid[0].length;
  const height = grid.length;
  let {row, col} = current;
  const { horizontal } = current;

  if (horizontal) {
    do {
      if (col === 0) {
        row = (row + height - 1) % height;
      }
      col = (col + width - 1) % width;
    } while (grid[row][col] == '#');
  } else {
    do {
      if (row === 0) {
        col = (col + width - 1) % width;
      }
      row = (row + height - 1) % height;
    } while (grid[row][col] == '#');
  }
  return {row, col, horizontal};
}