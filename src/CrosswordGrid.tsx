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
        />
      })
    )}
  </svg>
}
