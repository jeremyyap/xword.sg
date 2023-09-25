import { useState } from "react";
import CrosswordCell from "./CrosswordCell";
import { Ipuz } from "./Ipuz";

type Props = {
    data: Ipuz;
}

export default function CrosswordGrid({ data }: Props) {
  const { height, width } = data.dimensions;
  const puzzleGrid = data.puzzle;
  const answerGrid = data.solution;
  const inputGrid: Array<Array<string>> = Array.from({
    length: height
  }, () => new Array(width).fill(''));

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

  const [activeCell, setActiveCell] = useState(getInitialActiveState(puzzleGrid));
  const activeClue = activeCell.horizontal ? horizontalClues[activeCell.row][activeCell.col] : verticalClues[activeCell.row][activeCell.col];

  const handleClick = ({ row, col }: {row: number, col: number}) => {
    const {row: oldRow, col: oldCol, horizontal: oldHorizontal } = activeCell;
    const horizontal = row === oldRow && col === oldCol ? !oldHorizontal : true;
    setActiveCell({row, col, horizontal})
  }
  
  return <svg viewBox={`0 0 ${width} ${height}`} height={600} width={600}>
    {Array.from({length: width}, (_, i) => i).flatMap((row) => 
      Array.from({length: height}, (_, i) => i).map((col) => {
        return <CrosswordCell
          key={`${row} ${col}`}
          row={row}
          col={col}
          answer={answerGrid[row][col]}
          input={inputGrid[row][col]}
          cellInfo={puzzleGrid[row][col]}
          isActiveCell={activeCell.row === row && activeCell.col === col}
          isActiveClue={(activeCell.horizontal ? horizontalClues[row][col] : verticalClues[row][col]) === activeClue}
          onClick={handleClick}
        />
      })
    )}
  </svg>
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

function getClueNumber(cellInfo: Ipuz['puzzle'][number][number]): number | null {
  if (cellInfo instanceof Object) {
    return cellInfo.cell === 0 ? null : cellInfo.cell;
  }

  if (typeof cellInfo === "string") {
    return null;
  }

  return cellInfo === 0 ? null : cellInfo;
}
