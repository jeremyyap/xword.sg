import { useCallback, useEffect, useState } from "react";
import CrosswordCell from "./CrosswordCell";
import { Ipuz } from "./Ipuz";

type Props = {
    data: Ipuz;
}

export default function CrosswordGrid({ data }: Props) {
  const { height, width } = data.dimensions;
  const puzzleGrid = data.puzzle;
  const answerGrid = data.solution;
  const [inputGrid, setInputGrid] = useState(Array.from({
    length: height
  }, () => new Array(width).fill('')));

  const horizontalClues: Array<Array<number | null>> = Array.from({
    length: height
  }, () => new Array(width).fill(null));

  Array.from({length: height}, (_, i) => i).forEach((row) => {
    let lastClueNumber: number | null = null
    Array.from({length: width}, (_, i) => i).forEach((col) => {
      const cellInfo = puzzleGrid[row][col];
      if (cellInfo === '#') {
        lastClueNumber = null;
      }
      const clueNumber = getClueNumber(puzzleGrid[row][col]);
      lastClueNumber = lastClueNumber ?? clueNumber;

      horizontalClues[row][col] = lastClueNumber;
    })
  });

  const verticalClues: Array<Array<number | null>> = Array.from({
    length: height
  }, () => new Array(width).fill(null));

  Array.from({length: width}, (_, i) => i).forEach((col) => {
    let lastClueNumber: number | null = null
    Array.from({length: height}, (_, i) => i).forEach((row) => {
      const cellInfo = puzzleGrid[row][col];
      if (cellInfo === '#') {
        lastClueNumber = null;
      }
      const clueNumber = getClueNumber(puzzleGrid[row][col]);
      lastClueNumber = lastClueNumber ?? clueNumber;

      verticalClues[row][col] = lastClueNumber;
    })
  });

  const [selection, setSelection] = useState(getInitialActiveState(puzzleGrid));
  const {row: activeRow, col: activeCol, horizontal} = selection;
  const activeClue = horizontal ? horizontalClues[activeRow][activeCol] : verticalClues[activeRow][activeCol];

  const handleInput = useCallback((e: KeyboardEvent) => {
    if (/^[a-z0-9]$/i.test(e.key)) {
      setInputGrid(inputGrid => {
        const newInputGrid = [...inputGrid];
        newInputGrid[activeRow][activeCol] = e.key.toUpperCase();
        return newInputGrid;
      });
      setSelection(selection => getNextCell(puzzleGrid, selection));
    }
  }, [activeRow, activeCol, puzzleGrid]);

  useEffect(() => {
    document.addEventListener('keydown', handleInput);
    return () => document.removeEventListener('keydown', handleInput);
  }, [handleInput]);

  const handleClick = ({ row, col }: {row: number, col: number}) => {
    const {row: oldRow, col: oldCol, horizontal: oldHorizontal } = selection;
    const horizontal = row === oldRow && col === oldCol ? !oldHorizontal : true;
    setSelection({row, col, horizontal})
  }

  const acrossClues = Object.fromEntries(data.clues.Across);
  const downClues = Object.fromEntries(data.clues.Down);
  
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
            answer={answerGrid[row][col]}
            input={inputGrid[row][col]}
            cellInfo={puzzleGrid[row][col]}
            isActiveCell={activeRow === row && activeCol === col}
            isActiveClue={(selection.horizontal ? horizontalClues[row][col] : verticalClues[row][col]) === activeClue}
            onClick={handleClick}
          />
        })
      )}
    </svg>
    <div><strong>{activeClue}{horizontal ? 'A' : 'D'}</strong> {clueText}</div>
  </>
}

function getInitialActiveState(grid: Ipuz['puzzle']): {row: number, col: number, horizontal: boolean} {
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

function getNextCell(grid: Ipuz['puzzle'], current: {row: number, col: number, horizontal: boolean}): {row: number, col: number, horizontal: boolean} {
  let {row, col} = current;
  const { horizontal } = current;

  if (horizontal) {
    do {
      col = (col + 1) % grid[0].length;
      if (col === 0) {
        row = (row + 1) % grid.length;
      }
    } while (grid[row][col] == '#');
  } else {
    do {
      row = (row + 1) % grid.length;
      if (row === 0) {
        col = (col + 1) % grid[0].length;
      }
    } while (grid[row][col] == '#');
  }
  return {row, col, horizontal};
}

function getClueNumber(cellInfo: Ipuz['puzzle'][number][number]): number | null {
  if (cellInfo instanceof Object) {
    return cellInfo.cell === 0 ? null : cellInfo.cell;
  }

  if (typeof cellInfo === "string") {
    return null;
  }

  return cellInfo === 0 ? null : cellInfo;
}
