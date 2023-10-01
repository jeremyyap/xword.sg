import { useMemo } from 'react';

export default function useCrosswordData(data: IpuzData)  {
  return useMemo(() => {
    const { height, width } = data.dimensions;
    const acrossClueNumbers: Array<Array<number | null>> = Array.from({
      length: height
    }, () => new Array(width).fill(null));
  
    Array.from({length: height}, (_, i) => i).forEach((row) => {
      let lastClueNumber: number | null = null
      Array.from({length: width}, (_, i) => i).forEach((col) => {
        if (data.puzzle[row][col] === '#') {
          lastClueNumber = null;
        }
        const clueNumber = getClueNumber(data.puzzle[row][col]);
        lastClueNumber = lastClueNumber ?? clueNumber;
  
        acrossClueNumbers[row][col] = lastClueNumber;
      })
    });
  
    const downClueNumbers: Array<Array<number | null>> = Array.from({
      length: height
    }, () => new Array(width).fill(null));
  
    Array.from({length: width}, (_, i) => i).forEach((col) => {
      let lastClueNumber: number | null = null
      Array.from({length: height}, (_, i) => i).forEach((row) => {
        if (data.puzzle[row][col] === '#') {
          lastClueNumber = null;
        }
        const clueNumber = getClueNumber(data.puzzle[row][col]);
        lastClueNumber = lastClueNumber ?? clueNumber;
  
        downClueNumbers[row][col] = lastClueNumber;
      })
    });

    const { dimensions, puzzle, solution } = data;
    const acrossClues = Object.fromEntries(data.clues.Across);
    const downClues = Object.fromEntries(data.clues.Down);

    return {
      dimensions,
      puzzle,
      solution,
      acrossClueNumbers,
      acrossClues,
      downClueNumbers,
      downClues,
    }
  }, [data]);
}

function getClueNumber(cellInfo: IpuzData['puzzle'][number][number]): number | null {
  if (cellInfo instanceof Object) {
    return cellInfo.cell === 0 ? null : cellInfo.cell;
  }

  if (typeof cellInfo === "string") {
    return null;
  }

  return cellInfo === 0 ? null : cellInfo;
}


export type IpuzData = {
  origin: string;
  version: string;
  kind: Array<string>;
  copyright: string;
  author: string;
  publisher: string;
  title: string;
  intro: string;
  difficulty: string;
  empty: string;
  dimensions: {
    width: number;
    height: number;
  };
  puzzle: Array<
    Array<
      | string
      | number
      | {
          cell: number;
          style: {
            shapebg: string;
          };
        }
    >
  >;
  clues: {
    Across: Array<Array<string | number>>;
    Down: Array<Array<string | number>>;
  };
  solution: Array<Array<string>>;
};