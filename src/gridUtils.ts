import { CellData, CellSelection } from "./CrosswordData";

export function checkGrid(inputGrid: Array<Array<CellData>>, answerGrid: Array<Array<CellData>>): boolean {
    for (let row = 0; row < answerGrid.length; row++) {
      for (let col = 0; col < answerGrid[0].length; col++) {
        if (answerGrid[row][col] != '#' && answerGrid[row][col] != inputGrid[row][col]) {
          return false;
        }
      }
    }
    return true;
  }
  
  export function getInitialActiveState(grid: Array<Array<CellData>>): CellSelection {
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
  
  export function getNextCell(grid: Array<Array<CellData>>, current: CellSelection): CellSelection {
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
  
  export function getPreviousCell(grid: Array<Array<CellData>>, current: CellSelection): CellSelection {
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